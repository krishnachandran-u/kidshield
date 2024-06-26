//default settings
const defaultSettings = {
  notify: true,
  redirect: false,
};
const defaultIntensity = {
  neutral: 1,
  mild: 0,
  moderate: 0,
  severe: 0,
  extreme: 0,
}

//Save default settings on installation
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get('settings', function(data) {
      chrome.storage.local.set({ 'settings': defaultSettings }, function() {
        console.log('Default settings saved');
      });
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get('intensity', function(data) {
      chrome.storage.local.set({ 'intensity': defaultIntensity }, function() {
          console.log('Default intensity saved');
      });
  });
});

//Save default settings on startup
//For debugging purposes
//Force applies default settings on every startup

/*
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get('settings', function(data) {
      chrome.storage.local.set({ 'settings': defaultSettings }, function() {
          console.log('Default settings saved');
      });
  });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get('intensity', function(data) {
      chrome.storage.local.set({ 'intensity': defaultIntensity }, function() {
          console.log('Default intensity saved');
      });
  });
});
*/

//Retrieve settings from storage
async function getSettings(callback) {
  chrome.storage.local.get('settings', function(data) {
    const settings = data.settings || defaultSettings;
    callback(settings);
  });
}

//Redirect to a safe page if inappropriate content is detected
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId === 0 && details.tabId) {
    const tab = await chrome.tabs.get(details.tabId);
    const url = tab.url;
    if(url === 'https://krishnachandran-u.github.io/safesurf/') return;

    try {
      const content = await getContent(url);
      const detectedWords = content.filter(word => words.some(w => w.toLowerCase() === word.toLowerCase()));
      console.log(`Inappropriate words detected: ${detectedWords.join(', ')}`);

      if (detectedWords.length >= 5) {
        chrome.storage.local.get('settings', function(data) {
          const settings = data.settings || defaultSettings;

          if(settings.notify === true) notify(detectedWords); 
          if(settings.redirect === true) chrome.tabs.update(details.tabId, { url: 'https://krishnachandran-u.github.io/safesurf/' });

          // Classify based on the number of detected words
          let intensity = '';
          if (detectedWords.length >= 5 && detectedWords.length < 10) {
            intensity = 'mild';
          } else if (detectedWords.length >= 10 && detectedWords.length < 15) {
            intensity = 'moderate';
          } else if (detectedWords.length >= 15 && detectedWords.length < 20) {
            intensity = 'severe';
          } else if (detectedWords.length >= 20) {
            intensity = 'extreme';
          }

          // Increment the category count in chrome storage
          chrome.storage.local.get('intensity', function(data) {
            const intensityCount = data.intensity || {};
            intensityCount[intensity] = (intensityCount[intensity] || 0) + 1;
            chrome.storage.local.set({ 'intensity': intensityCount }, function() {
              console.log(`Intensity count updated: ${intensityCount}`);
            });
          });
        });
      } else {
        // Increment the neutral count in chrome storage
        chrome.storage.local.get('intensity', function(data) {
          const intensityCount = data.intensity || {};
          intensityCount.neutral = (intensityCount.neutral || 0) + 1;
          chrome.storage.local.set({ 'intensity': intensityCount }, function() {
            console.log(`Intensity count updated: ${intensityCount}`);
          });
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}, { url: [{ hostContains: '' }] });

//Notify user on inappropriate content
async function notify(detectedWords) {
  const notificationOptions = {
    type: "basic",
    iconUrl: "notification.png",
    title: "Inappropriate Content Detected!",
    //message: detectedWords ? `Words: ${detectedWords.join(', ')}` : "",
    message: "Enable redirect to block the content."
  };

  chrome.notifications.create("inappropriate-content", notificationOptions, (notificationId) => {
    console.log(`Notification created: ${notificationId}`);
  });
}

//Fetch content from the URL and return unique words
async function getContent(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const plainText = data.replace(/<\/?[^>]+(>|$)/g, '').replace(/[^a-zA-Z ]/g, ' ');
      const wordArray = plainText.split(' ').filter(word => word.trim() !== '');
      const uniqueWords = new Set(wordArray);
      return Array.from(uniqueWords);
    })
    .catch(error => {
      console.error('Error:', error);
      return null;
    });
}

//List of inappropriate words
const words = [
    "2g1c",
    "2 girls 1 cup",
    "acrotomophilia",
    "alabama hot pocket",
    "alaskan pipeline",
    "anal",
    "anilingus",
    "anus",
    "apeshit",
    "arsehole",
    "ass",
    "asshole",
    "assmunch",
    "auto erotic",
    "autoerotic",
    "babeland",
    "baby batter",
    "baby juice",
    "ball gag",
    "ball gravy",
    "ball kicking",
    "ball licking",
    "ball sack",
    "ball sucking",
    "bangbros",
    "bangbus",
    "bareback",
    "barely legal",
    "barenaked",
    "bastard",
    "bastardo",
    "bastinado",
    "bbw",
    "bdsm",
    "beaner",
    "beaners",
    "beaver cleaver",
    "beaver lips",
    "beastiality",
    "bestiality",
    "big black",
    "big breasts",
    "big knockers",
    "big tits",
    "bimbos",
    "birdlock",
    "bitch",
    "bitches",
    "black cock",
    "blonde action",
    "blonde on blonde action",
    "blowjob",
    "blow job",
    "blow your load",
    "blue waffle",
    "blumpkin",
    "bollocks",
    "bondage",
    "boner",
    "boob",
    "boobs",
    "booty call",
    "brown showers",
    "brunette action",
    "bukkake",
    "bulldyke",
    "bullet vibe",
    "bullshit",
    "bung hole",
    "bunghole",
    "busty",
    // "butt",
    "buttcheeks",
    "butthole",
    "camel toe",
    "camgirl",
    "camslut",
    "camwhore",
    "carpet muncher",
    "carpetmuncher",
    "chocolate rosebuds",
    "cialis",
    "circlejerk",
    "cleveland steamer",
    "clit",
    "clitoris",
    "clover clamps",
    "clusterfuck",
    "cock",
    "cocks",
    "coprolagnia",
    "coprophilia",
    "cornhole",
    "coon",
    "coons",
    "creampie",
    // "cum",
    "cumming",
    "cumshot",
    "cumshots",
    "cunnilingus",
    "cunt",
    "darkie",
    "date rape",
    "daterape",
    "deep throat",
    "deepthroat",
    "dendrophilia",
    "dick",
    "dildo",
    "dingleberry",
    "dingleberries",
    "dirty pillows",
    "dirty sanchez",
    "doggie style",
    "doggiestyle",
    "doggy style",
    "doggystyle",
    "dog style",
    "dolcett",
    "domination",
    "dominatrix",
    "dommes",
    "donkey punch",
    "double dong",
    "double penetration",
    "dp action",
    "dry hump",
    "dvda",
    "eat my ass",
    "ecchi",
    "ejaculation",
    "erotic",
    "erotism",
    "escort",
    "eunuch",
    "fag",
    "faggot",
    "fecal",
    "felch",
    "fellatio",
    "feltch",
    "female squirting",
    "femdom",
    "figging",
    "fingerbang",
    "fingering",
    "fisting",
    "foot fetish",
    "footjob",
    "frotting",
    "fuck",
    "fuck buttons",
    "fuckin",
    "fucking",
    "fucktards",
    "fudge packer",
    "fudgepacker",
    "futanari",
    "gangbang",
    "gang bang",
    "gay sex",
    "genitals",
    "giant cock",
    "girl on",
    "girl on top",
    "girls gone wild",
    "goatcx",
    "goatse",
    "god damn",
    "gokkun",
    "golden shower",
    "goodpoop",
    "goo girl",
    "goregasm",
    "grope",
    "group sex",
    "g-spot",
    "guro",
    "hand job",
    "handjob",
    "hard core",
    "hardcore",
    "hentai",
    "homoerotic",
    "honkey",
    "hooker",
    "horny",
    "hot carl",
    "hot chick",
    "how to kill",
    "how to murder",
    "huge fat",
    "humping",
    "incest",
    "intercourse",
    "jack off",
    "jail bait",
    "jailbait",
    "jelly donut",
    "jerk off",
    "jigaboo",
    "jiggaboo",
    "jiggerboo",
    "jizz",
    "juggs",
    "kike",
    "kinbaku",
    "kinkster",
    "kinky",
    "knobbing",
    "leather restraint",
    "leather straight jacket",
    "lemon party",
    "livesex",
    "lolita",
    "lovemaking",
    "make me come",
    "male squirting",
    "masturbate",
    "masturbating",
    "masturbation",
    "menage a trois",
    "milf",
    "missionary position",
    "mong",
    "motherfucker",
    "mound of venus",
    "mr hands",
    "muff diver",
    "muffdiving",
    "nambla",
    "nawashi",
    "negro",
    "neonazi",
    "nigga",
    "nigger",
    "nig nog",
    "nimphomania",
    "nipple",
    "nipples",
    "nsfw",
    "nsfw images",
    "nude",
    "nudity",
    "nutten",
    "nympho",
    "nymphomania",
    "octopussy",
    "omorashi",
    "one cup two girls",
    "one guy one jar",
    "orgasm",
    "orgy",
    "paedophile",
    "paki",
    "panties",
    "panty",
    "pedobear",
    "pedophile",
    "pegging",
    "penis",
    "phone sex",
    "piece of shit",
    "pikey",
    "pissing",
    "piss pig",
    "pisspig",
    "playboy",
    "pleasure chest",
    "pole smoker",
    "ponyplay",
    "poof",
    "poon",
    "poontang",
    "punany",
    "poop chute",
    "poopchute",
    "porn",
    "porno",
    "pornography",
    "prince albert piercing",
    "pthc",
    "pubes",
    "pussy",
    "queaf",
    "queef",
    "quim",
    "raghead",
    "raging boner",
    "rape",
    "raping",
    "rapist",
    "rectum",
    "reverse cowgirl",
    "rimjob",
    "rimming",
    "rosy palm",
    "rosy palm and her 5 sisters",
    "rusty trombone",
    "sadism",
    "santorum",
    "scat",
    "schlong",
    "scissoring",
    "semen",
    "sex",
    "sexcam",
    "sexo",
    "sexy",
    "sexual",
    // "sexually",
    "sexuality",
    "shaved beaver",
    "shaved pussy",
    "shemale",
    "shibari",
    "shit",
    "shitblimp",
    "shitty",
    "shota",
    "shrimping",
    "skeet",
    "slanteye",
    "slut",
    "s&m",
    "smut",
    "snatch",
    "snowballing",
    "sodomize",
    "sodomy",
    "spastic",
    "spic",
    "splooge",
    "splooge moose",
    "spooge",
    "spread legs",
    "spunk",
    "strap on",
    "strapon",
    "strappado",
    "strip club",
    "style doggy",
    "suck",
    "sucks",
    "suicide girls",
    "sultry women",
    "swastika",
    "swinger",
    "tainted love",
    "taste my",
    "tea bagging",
    "threesome",
    "throating",
    "thumbzilla",
    "tied up",
    "tight white",
    "tit",
    "tits",
    "titties",
    "titty",
    "tongue in a",
    "topless",
    "tosser",
    "towelhead",
    "tranny",
    "tribadism",
    "tub girl",
    "tubgirl",
    "tushy",
    "twat",
    "twink",
    "twinkie",
    "two girls one cup",
    "undressing",
    "upskirt",
    "urethra play",
    "urophilia",
    "vagina",
    "venus mound",
    "viagra",
    "vibrator",
    "violet wand",
    "vorarephilia",
    "voyeur",
    "voyeurweb",
    "voyuer",
    "vulva",
    // "wank",
    "wetback",
    "wet dream",
    "white power",
    "whore",
    "worldsex",
    "wrapping men",
    "wrinkled starfish",
    // "xx",
    // "xxx",
    "yaoi",
    "yellow showers",
    "yiffy",
    "zoophilia",
    "🖕"
];


