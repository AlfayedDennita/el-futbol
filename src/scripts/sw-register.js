if ("serviceWorker" in navigator) {
   window.addEventListener("load", () => {      
      registerServiceWorker();
      requestPermission();
   });
} else {
   console.log("Service Worker belum didukung browser ini");
}

function registerServiceWorker() {
   return navigator.serviceWorker.register("./service-worker.js")
      .then(() => {
         console.log("Pendaftaran Service Worker berhasil");
      })
      .catch(() => {
         console.log("Pendaftaran Service Worker gagal");
      });
}

function requestPermission() {

   if ("Notification" in window) {

      Notification.requestPermission().then(result => {
         if(result === "denied") {
            console.log("Notifikasi tidak diizinkan");
            return;
         } else if (result === "default") {
            console.log("Menutup kotak dialog");
            return;
         }

         navigator.serviceWorker.ready.then(() => {
            if("PushManager" in window) {
               navigator.serviceWorker.getRegistration().then(registration => {
                  registration.pushManager.subscribe({
                     userVisibleOnly: true,
                     applicationServerKey: urlBase64ToUint8Array("BIMLeKShkuzR1-QaHVOvgsjqU2aWy2R54mRLgnzdG5u0NV6g4McSu8JzgiA5_ndEoVbXiWA9CB2g9GrgvkCOXjQ")
                  })
                     .then(subscribe => {
                        console.log("Endpoint:", subscribe.endpoint);
                        console.log("p256h key:", btoa(String.fromCharCode.apply(null, new Uint8Array(subscribe.getKey("p256dh")))));
                        console.log("Auth key:", btoa(String.fromCharCode.apply(null, new Uint8Array(subscribe.getKey("auth")))));
                     })
                     .catch(error => {
                        console.error("Tidak dapat melakukan subscribe", error.message);
                     });
               });
            }
         });
      });

   }

}

//---- Base 64 to Uint8Array

function urlBase64ToUint8Array(base64String) {
   const padding = "=".repeat((4- base64String.length % 4) % 4),
         base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/"),
         rawData = window.atob(base64),
         outputArray = new Uint8Array(rawData.length);
   
   for(let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
   }

   return outputArray;
}