require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// To track the last reminded event ID
let lastRemindedEventId = null;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(() => {
    checkScheduledEvents();
  }, 5 * 60 * 1000); // every 5 minutes
});

async function checkScheduledEvents() {
  const guildId = process.env.GUILD_ID;
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.error('Guild ID is incorrect.');
    return;
  }

  try {
    const events = await guild.scheduledEvents.fetch();

    events.forEach(event => {
      console.log(`Event: ${event.name}, Starts at: ${event.scheduledStartAt}`);
      const now = Date.now();
      const startTime = new Date(event.scheduledStartTimestamp).getTime();
      const diff = startTime - now;

      // Check if it's within the 3-hour window and hasn't been reminded yet
      if (diff > 2.9 * 60 * 60 * 1000 && diff < 3.1 * 60 * 60 * 1000 && event.id !== lastRemindedEventId) {
        console.log(`Reminder will be sent for event: ${event.name}`);
        sendReminder(event);
        lastRemindedEventId = event.id; // Store the ID of the reminded event
      } else {
        console.log(`[${currentTime}] Event ${event.name} is not within the 3-hour reminder window or has already been reminded.`);
      }
    });

  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

async function sendReminder(event) {
  const channelId = process.env.CHANNEL_ID; 
  const roleIdToPing = process.env.ROLE_ID; 

  try {
    // Checking if the event is part of the series
    if (!event.name.toLowerCase().includes("raid")) {
      console.log(`Skipping event: not part of the target recurrence.`);
      return;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error('Event channel not found');
      return;
    }

    const reminderMessage = `⏰ Reminder: <@&${roleIdToPing}> we raid in 3hrs!`;

    await channel.send(reminderMessage);
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

client.login(process.env.TOKEN);