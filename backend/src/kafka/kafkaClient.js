const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
    clientId: 'airbnb-app',
    brokers: [process.env.KAFKA_BROKER || 'kafka-service:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

// Topics
const TOPICS = {
    BOOKING_REQUESTS: 'booking-requests',
    BOOKING_STATUS_UPDATES: 'booking-status-updates',
    PROPERTY_UPDATES: 'property-updates'
};

// Create producer
const producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000
});

// Create consumer
const consumer = kafka.consumer({
    groupId: 'airbnb-backend-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000
});

// Producer helper function
async function publishMessage(topic, message) {
    try {
        await producer.connect();
        
        const result = await producer.send({
            topic,
            messages: [
                {
                    key: message.key || Date.now().toString(),
                    value: JSON.stringify(message.value),
                    headers: {
                        timestamp: Date.now().toString(),
                        source: 'airbnb-backend'
                    }
                }
            ]
        });
        
        console.log(`✅ Message published to topic "${topic}":`, result);
        return result;
    } catch (error) {
        console.error(`❌ Error publishing to topic "${topic}":`, error);
        throw error;
    }
}

// Consumer helper function
async function consumeMessages(topics, messageHandler) {
    try {
        await consumer.connect();
        await consumer.subscribe({ 
            topics: Array.isArray(topics) ? topics : [topics],
            fromBeginning: false 
        });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const value = JSON.parse(message.value.toString());
                    console.log(`📥 Received message from topic "${topic}":`, {
                        partition,
                        offset: message.offset,
                        value
                    });
                    
                    await messageHandler(topic, value, message);
                } catch (error) {
                    console.error('❌ Error processing message:', error);
                }
            }
        });

        console.log(`🎧 Consumer listening to topics:`, topics);
    } catch (error) {
        console.error('❌ Error in consumer:', error);
        throw error;
    }
}

// Graceful shutdown
const shutdown = async () => {
    console.log('📴 Shutting down Kafka connections...');
    await producer.disconnect();
    await consumer.disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
    kafka,
    producer,
    consumer,
    TOPICS,
    publishMessage,
    consumeMessages,
    shutdown
};

