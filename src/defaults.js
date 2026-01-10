const TR_WORDS = ['amk', 'aq', 'sik', 'oç', 'piç', 'yarrak', 'yarak', 'orospu', 'kahpe', 'göt', 'siktir', 'ibne', 'yavşak', 'kaşar', 'amcık', 'meme', 'kaltak'];

const EN_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'bastard', 'whore', 'slut', 'cunt', 'cock', 'nigger', 'faggot'];

const ADS = [
   'discord.gg',
   'discordapp.com/invite',
   'discord.com/invite',
   'https://',
   'http://',
   '.com',
   '.net',
   '.org',
   '.xyz',
   '.tk',
   '.pw',
   '.io',
   '.me',
   '.gg',
   'twitch.tv',
   'youtube.com/channel',
   'youtube.com/c/',
   'youtu.be',
];

module.exports = {
   DEFAULT_WORDS: [...TR_WORDS, ...EN_WORDS],
   DEFAULT_ADS: ADS,
};
