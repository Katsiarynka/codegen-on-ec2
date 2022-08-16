import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2'


interface IEc2Props {
    VpcId: string;
    ImageName?: string;
    InstanceType?: string;
    InstanceIAMRoleArn?: string;
    InstancePort?: number;
    HealthCheckPath?: string;
    HealthCheckPort?: string;
    HealthCheckHttpCodes?: string;
}


export class Ec2 extends Construct {

	readonly loadBalancer: elbv2.ApplicationLoadBalancer
    constructor(scope: Construct, id: string, props: IEc2Props) {
        super(scope, id);
    }

}