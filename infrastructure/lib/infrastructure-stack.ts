import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Ec2 } from './ec2/ec2';
import { stage } from './config/parameters';

export class InfrastructureStack extends cdk.Stack {
  readonly ec2: Ec2;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.ec2 = new Ec2(scope, 'Ec2Configurations', {
      "VpcId": stage.vpcId,
    });
    new s3.Bucket(this, 'salesforce-codegen-models', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
