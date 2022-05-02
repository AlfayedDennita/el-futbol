const webPush = require("web-push");

const vapidKeys = {
   publicKey: "BIMLeKShkuzR1-QaHVOvgsjqU2aWy2R54mRLgnzdG5u0NV6g4McSu8JzgiA5_ndEoVbXiWA9CB2g9GrgvkCOXjQ",
   privateKey: "jynSpSKydwAgb9LNsLHAEUv5NliqsBsO3XF8znqwvmc"
};

webPush.setVapidDetails(
   "mailto:name@domain.com",
   vapidKeys.publicKey,
   vapidKeys.privateKey
);

// Endpoint dan keys dapat berubah-ubah (sesuai console)

const pushSubscription = {
   endpoint: "https://fcm.googleapis.com/fcm/send/dqkw2Alu1EU:APA91bGIVYPCgIni1ZzmTkZi_sTkZ-fPKdMqFQwm-lLJZF20v9nAqUQPkNpVsU4HxumzhVysp08S35efSJmg-TGBBxsAosMLeApBaTJI73l3jbwsQSFLkV1Pb8tkkbuu_GFw1rK6v0Uq",
   keys: {
      "p256dh": "BAcaDhtSDVALfJP5rVpSYgwhVbOdnmIDphD5wavAxvGXhwQidw+Vb4KMcbLhiQfhrmyl2n9cHJ1A8EjVzzKo4Gk=",
      "auth": "2ZnFDnZPG+DI+Oj976/RTA=="
   }
};

const payload = "Berhasil menerima notifikasi!",
      options = {
         gcmAPIKey: "887010182834",
         TTL: 60
      };

webPush.sendNotification(pushSubscription, payload, options);