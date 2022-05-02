import idb from "idb";

const database =
   idb.open("el-futbol", 2, upgradeDB => {
      switch(upgradeDB.oldVersion) {
         case 0:
            if(!upgradeDB.objectStoreNames.contains("club-data")) {
               const clubsObjectStore = upgradeDB.createObjectStore("club-data", {
                  keyPath: "id"
               });
               clubsObjectStore.createIndex("name", "name");
            }
         case 1:
            if(!upgradeDB.objectStoreNames.contains("favorites")) {
               const clubsObjectStore = upgradeDB.createObjectStore("favorites", {
                  keyPath: "id"
               });
               clubsObjectStore.createIndex("name", "name");
            }
      }
});

//----- Function Object Store = club-data

export function saveClubData(club) {
   database
      .then(db => {
         const tx = db.transaction("club-data", "readwrite"),
               store = tx.objectStore("club-data");
         store.put(club);
         return tx.complete;
      });
}

export function getSavedClubData(id) {
   return new Promise((resolve, reject) => {
      database
         .then(db => {
            const tx = db.transaction("club-data", "readonly"),
                  store = tx.objectStore("club-data");
            return store.get(id);
         })
         .then(club => {
            resolve(club);
         });
   });
}

export function getAllClubData() {
   return new Promise((resolve, reject) => {
      database
         .then(db => {
            const tx = db.transaction("club-data", "readonly"),
                  store = tx.objectStore("club-data");
            return store.getAll();
         })
         .then(clubs => {
            resolve(clubs);
         });
   });
}

//----- Function Object Store = favorites

export function saveFavorites(club) {
   database
      .then(db => {
         const tx = db.transaction("favorites", "readwrite"),
               store = tx.objectStore("favorites");
         store.add(club)
         return tx.complete;
      });
}

export function getFavoriteClub(id){
   return new Promise((resolve, reject) => {
      database
         .then(db => {
            const tx = db.transaction("favorites", "readonly"),
                  store = tx.objectStore("favorites");
            return store.get(id);
         })
         .then(data => {
            resolve(data);
         });
   });
}

export function getAllFavoriteClubs() {
   return new Promise((resolve, reject) => {
      database
         .then(db => {
            const tx = db.transaction("favorites", "readonly"),
                  store = tx.objectStore("favorites");
            return store.getAll();
         })
         .then(clubs => {
            resolve(clubs);
         });
   });
}

export function deleteFavoriteClub(id) {
   database
      .then(db => {
         const tx = db.transaction("favorites", "readwrite"),
               store = tx.objectStore("favorites");
         store.delete(id);
         return tx.complete;
      });
}