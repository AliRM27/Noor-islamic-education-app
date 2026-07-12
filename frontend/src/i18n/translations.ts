// Flat UI-chrome translation dictionaries. Content (topic/lesson titles, Dua
// translations) is localized separately via `localizeContent.ts`, since it
// comes from the API rather than being a static UI string.

export type Locale = 'en' | 'de';

export const translations = {
  en: {
    // Onboarding — welcome
    welcomeSubtitle: 'Learn the Arabic Alphabet',
    welcomeCta: "Let's Start! 🌙",

    // Onboarding — name/PIN
    alertEnterName: 'Please enter your name 😊',
    alertPinLength: 'PIN must be 4 digits 🔒',
    alertErrorTitle: 'Error',
    alertSomethingWrong: 'Something went wrong',
    whatsYourName: "What's your name?",
    yourNamePlaceholder: 'Your name...',
    greeting: 'Hi, {name}!',
    setPinSubtitle: 'Set a 4-digit PIN so a parent can check your progress',
    loading: 'Loading…',
    next: 'Next →',
    letsGo: "Let's go! 🌙",

    // Home
    whatToLearnToday: 'What do you want to learn today?',
    agesRange: 'Ages {min}-{max}',
    topicComplete: '✓ Complete',
    lessonsProgress: '{completed} / {total} lessons',
    categoryAlphabet: 'Alphabet',
    categoryBasics: 'Basics',
    categoryKids: 'Kids',

    // Topic lesson grid
    backToTopics: '‹ Topics',
    lessonsLearned: '{completed} / {total} lessons learned',
    couldNotLoadLessons: 'Could not load lessons. Pull to retry.',
    noLessonsYet: 'No lessons yet — check back soon!',

    // Lesson — shared
    tapToHear: 'Tap to hear',
    imReady: "I'm ready! →",
    stepOf: 'Step {n} of {total}',
    back: 'Back →',
    couldNotLoadLesson: "Couldn't load this lesson. Check your connection and try again.",

    // Lesson — listen_tap / tap_letter / match_name
    tapLetterYouHear: 'Tap the letter you hear 👂',
    whichLetterIs: 'Which letter is "{name}"? 🤔',
    tapFormUsed: 'Tap the form used {label} 🔤',
    positionAlone: 'ALONE',
    positionStart: 'at the START',
    positionMiddle: 'in the MIDDLE',
    positionEnd: 'at the END',
    howToSpell: 'How to spell it',
    formAlone: 'Alone',
    formStart: 'Start',
    formMiddle: 'Middle',
    formEnd: 'End',

    // Lesson — tracing
    traceTheLetter: 'Trace the letter ✏️',
    clear: 'Clear ↺',
    doneTracing: 'Done tracing! ✏️',
    traceMoreFirst: 'Trace a bit more first! ✏️',

    // Lesson — listen_repeat
    listenAndRepeat: 'Listen and repeat 🔁',
    iRepeatedIt: 'I repeated it! ✓',

    // Lesson — meaning_match
    whenDoYouSay: 'When do you say this dua? 🤲',

    // Lesson — word_order
    putWordsInOrder: 'Put the words in order 🧩',

    // Lesson — done
    greatJob: 'Great job!',
    youLearned: 'You learned {name}',
    backToLessons: 'Back to lessons →',

    // Not found
    notFoundTitle: 'Not Found',
    pageNotFound: 'Page not found',
    goHome: 'Go home',
  },
  de: {
    // Onboarding — welcome
    welcomeSubtitle: 'Lerne das arabische Alphabet',
    welcomeCta: 'Los geht\'s! 🌙',

    // Onboarding — name/PIN
    alertEnterName: 'Bitte gib deinen Namen ein 😊',
    alertPinLength: 'Die PIN muss 4 Ziffern haben 🔒',
    alertErrorTitle: 'Fehler',
    alertSomethingWrong: 'Etwas ist schiefgelaufen',
    whatsYourName: 'Wie heißt du?',
    yourNamePlaceholder: 'Dein Name...',
    greeting: 'Hallo, {name}!',
    setPinSubtitle: 'Lege eine 4-stellige PIN fest, damit ein Elternteil deinen Fortschritt sehen kann',
    loading: 'Lädt…',
    next: 'Weiter →',
    letsGo: 'Los geht\'s! 🌙',

    // Home
    whatToLearnToday: 'Was möchtest du heute lernen?',
    agesRange: 'Alter {min}-{max}',
    topicComplete: '✓ Fertig',
    lessonsProgress: '{completed} / {total} Lektionen',
    categoryAlphabet: 'Alphabet',
    categoryBasics: 'Grundlagen',
    categoryKids: 'Kinder',

    // Topic lesson grid
    backToTopics: '‹ Themen',
    lessonsLearned: '{completed} / {total} Lektionen gelernt',
    couldNotLoadLessons: 'Lektionen konnten nicht geladen werden. Zum Wiederholen ziehen.',
    noLessonsYet: 'Noch keine Lektionen — schau bald wieder vorbei!',

    // Lesson — shared
    tapToHear: 'Zum Anhören tippen',
    imReady: 'Ich bin bereit! →',
    stepOf: 'Schritt {n} von {total}',
    back: 'Zurück →',
    couldNotLoadLesson: 'Diese Lektion konnte nicht geladen werden. Überprüfe deine Verbindung und versuche es erneut.',

    // Lesson — listen_tap / tap_letter / match_name
    tapLetterYouHear: 'Tippe den Buchstaben, den du hörst 👂',
    whichLetterIs: 'Welcher Buchstabe ist „{name}"? 🤔',
    tapFormUsed: 'Welche Form wird {label} verwendet? 🔤',
    positionAlone: 'ALLEIN',
    positionStart: 'am ANFANG',
    positionMiddle: 'in der MITTE',
    positionEnd: 'am ENDE',
    howToSpell: 'So schreibst du es',
    formAlone: 'Allein',
    formStart: 'Anfang',
    formMiddle: 'Mitte',
    formEnd: 'Ende',

    // Lesson — tracing
    traceTheLetter: 'Zeichne den Buchstaben nach ✏️',
    clear: 'Löschen ↺',
    doneTracing: 'Fertig mit Zeichnen! ✏️',
    traceMoreFirst: 'Zeichne noch etwas mehr! ✏️',

    // Lesson — listen_repeat
    listenAndRepeat: 'Hören und nachsprechen 🔁',
    iRepeatedIt: 'Ich hab\'s nachgesprochen! ✓',

    // Lesson — meaning_match
    whenDoYouSay: 'Wann sagst du dieses Bittgebet? 🤲',

    // Lesson — word_order
    putWordsInOrder: 'Bringe die Wörter in die richtige Reihenfolge 🧩',

    // Lesson — done
    greatJob: 'Gut gemacht!',
    youLearned: 'Du hast {name} gelernt',
    backToLessons: 'Zurück zu den Lektionen →',

    // Not found
    notFoundTitle: 'Nicht gefunden',
    pageNotFound: 'Seite nicht gefunden',
    goHome: 'Zur Startseite',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
