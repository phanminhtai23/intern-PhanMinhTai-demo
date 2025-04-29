// AWS SNS SDK
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TOPIC_ARN = process.env.LEAD_NEW_TOPIC_ARN!; // ARN của SNS topic “Lead.New”

export const snsClient = new SNSClient({ region: REGION });