import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { logger } from "./log";

// Cấu hình AWS SQS
const REGION = process.env.AWS_REGION || "us-east-1";
const QUEUE_URL = process.env.LEAD_SQS_QUEUE_URL!; // URL của hàng đợi SQS

const sqsClient = new SQSClient({ region: REGION });

async function processMessages() {
    try {
        // Nhận message từ SQS
        const receiveParams = {
            QueueUrl: QUEUE_URL,
            MaxNumberOfMessages: 10, // Số lượng message tối đa nhận mỗi lần
            WaitTimeSeconds: 20, // Thời gian chờ để nhận message
        };

        const command = new ReceiveMessageCommand(receiveParams);
        const response = await sqsClient.send(command);

        if (response.Messages && response.Messages.length > 0) {
            for (const message of response.Messages) {
                // Ghi log message
                logger.info("Received message from SQS", {
                    messageId: message.MessageId,
                    body: message.Body,
                });

                console.log("Message received:", message.Body);

                // Xóa message khỏi hàng đợi sau khi xử lý
                if (message.ReceiptHandle) {
                    const deleteParams = {
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle,
                    };
                    const deleteCommand = new DeleteMessageCommand(deleteParams);
                    await sqsClient.send(deleteCommand);
                    logger.info("Deleted message from SQS", { messageId: message.MessageId });
                }
            }
        } else {
            console.log("No messages received");
        }
    } catch (error) {
        console.error("Error processing SQS messages:", error);
        if (error instanceof Error) {
            logger.error("Error processing SQS messages", { error: error.message });
        } else {
            logger.error("Error processing SQS messages", { error: String(error) });
        }
    }
}

// Worker chạy liên tục để lắng nghe SQS
export async function startWorker() {
    console.log("Starting SQS worker...");
    while (true) {
        await processMessages();
    }
}
// startWorker();
// startWorker().catch((error) => {
//     console.error("Worker failed to start:", error);
//     logger.error("Worker failed to start", { error: error.message });
// });

// startWorker();