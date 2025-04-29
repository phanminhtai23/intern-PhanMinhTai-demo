import winston from "winston";

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "./utils/audit.log" }),
        new winston.transports.Console()
    ]
});

// Test log message to ensure the logger writes to the file
// logger.info("Test log message", {
//     timestamp: new Date().toISOString(),
//     message: "This is a test log entry"
// });

// logger.info("CREATE_LEAD", {
//     userId: "123",
//     workspaceId: "456",
//     details: { name: "John Doe", email: "john.doe@example.com" },
//     status: "SUCCESS"
// });