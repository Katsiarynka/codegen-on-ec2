import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { stage } from './config/parameters';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as path from 'path';


export class MachineImageConverter implements ec2.IMachineImage {
  declare machineImageConfig: ec2.MachineImageConfig;

  constructor(machineImageConfig: ec2.MachineImageConfig) {
    this.machineImageConfig = machineImageConfig;
   }
  getImage(scope: Construct): cdk.aws_ec2.MachineImageConfig {
    return this.machineImageConfig;
  }
}


export class InfrastructureStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    const env = { account: stage.account, region: stage.region }
    super(scope, id, {env: env});

    // import VPC
    const vpc = ec2.Vpc.fromLookup(this, 'CodegenVPC', {
      vpcId: stage.vpcId,
    });

    // Allow SSH (TCP Port 22) access from anywhere
    const securityGroup = new ec2.SecurityGroup(this, 'CodegenSecurityGroup', {
      vpc,
      description: 'Allow SSH (TCP port 22) in',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access')
 
    const role = new iam.Role(this, 'codegenEc2RoleKate', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    })
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'))
    
    // Use Latest Amazon Linux Image - CPU Type ARM64
    const ami: ec2.MachineImageConfig = {
      imageId: 'ami-0c540d0a8d605fadb',
      osType: ec2.OperatingSystemType.LINUX,
      userData: ec2.UserData.forLinux()
    };

    const asg = new autoscaling.AutoScalingGroup(this, 'CodegenASG', {
      vpc,
      // instanceType: ec2.InstanceType.of(ec2.InstanceClass.P2, ec2.InstanceSize.XLARGE),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MEDIUM),
      machineImage: new MachineImageConverter(ami),
      securityGroup: securityGroup,
      role: role,
      keyName: 'codegen-kate',
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [asg]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');


    // Create an asset that will be used as part of User Data to run on first load
    const asset = new Asset(this, 'CodegenAsset', { path: path.join(__dirname, '../../codegen') });
    const localPath = asg.userData.addS3DownloadCommand({
      bucket: asset.bucket,
      bucketKey: asset.s3ObjectKey,
    });

    // asg.addUserData(dockerAsset);

    asg.userData.addExecuteFileCommand({
      filePath: localPath,
      arguments: 'poetry install && poetry shell && poetry run python -m codegen.server'
    });
    asset.grantRead(role);

    new s3.Bucket(this, 'salesforce-codegen-models', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
