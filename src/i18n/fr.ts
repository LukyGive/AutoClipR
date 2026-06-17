export const fr = {
  common: {
    active: "Actif",
    add: "Ajouter",
    apiTriggerKey: "Clé de déclenchement API",
    comingSoon: "Bientôt",
    copy: "Copier",
    copied: "Copié",
    createClip: "Créer un clip",
    dashboard: "Tableau de bord",
    download: "Télécharger",
    edit: "Modifier",
    hide: "Masquer",
    login: "Connexion",
    open: "Ouvrir",
    paused: "En pause",
    ready: "Prêt",
    remove: "Supprimer",
    save: "Enregistrer",
    show: "Afficher",
    signOut: "Se déconnecter",
    streamer: "Streamer",
    unknownChannel: "Chaîne inconnue",
    untitledClip: "Clip sans titre",
    unlimited: "Illimité"
  },
  nav: {
    aiTriggers: "Déclencheurs IA",
    billing: "Facturation",
    botRules: "Règles du bot",
    clips: "Clips",
    dashboard: "Tableau de bord",
    docs: "Docs",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    rules: "Règles",
    settings: "Paramètres",
    support: "Support",
    streamers: "Streamers"
  },
  appShell: {
    botStatus: "Statut du bot",
    createMonitorAutomate: "Crée, surveille et automatise tes clips Twitch.",
    readyForChatCommands: "Prêt pour les commandes chat",
    railwayWorkerHint:
      "Garde le worker Railway en ligne pour écouter les déclencheurs du chat Twitch.",
    welcomeBack: "Bon retour"
  },
  landing: {
    badge: "Automatisation Twitch pour streamers sérieux",
    builtForScale: "Pensé pour scaler",
    chatWorkerReady: "Worker chat prêt",
    ctaPrimary: "Démarrer l’essai gratuit",
    ctaSecondary: "Voir la démo",
    dashboardPreview: "Aperçu du dashboard",
    dashboardPreviewBotOnline: "Bot en ligne",
    dashboardPreviewManualClip: "Clip manuel",
    dashboardPreviewWelcome: "Bon retour",
    dashboardPreviewBody:
      "Surveille tes clips, streamers, statut du bot et usage depuis un centre de commande clair.",
    dashboardPreviewTitle: "Tout ce qu’un streamer doit voir, sans bruit.",
    featureApiBody:
      "Déclenche des clips depuis des boutons externes, outils ou overlays avec des URLs sécurisées.",
    featureApiTitle: "Déclencheurs API",
    featureChatBody:
      "Permets aux modérateurs ou viewers de créer des clips avec une commande simple comme !clip.",
    featureChatTitle: "Commandes chat",
    featureDownloadsBody:
      "Ouvre, modifie et télécharge tes clips prêts depuis le dashboard.",
    featureDownloadsTitle: "Téléchargement de clips",
    featureTrialBody:
      "Commence avec les fonctionnalités Pro et valide ton workflow avant de payer.",
    featureTrialTitle: "Essai Pro de 7 jours",
    featuresTitle: "Construit pour les vrais workflows de streamers.",
    footer: "AutoClipR. Conçu pour les créateurs Twitch.",
    heroSubtitle:
      "AutoClipR transforme les commandes chat et déclencheurs API en clips Twitch instantanément. La détection vocale IA arrive bientôt.",
    heroTitle: "Crée des clips Twitch automatiquement.",
    howItWorks: "Comment ça marche",
    officialTwitchApi: "API Twitch officielle",
    pricingTitle: "Commence gratuitement. Passe au plan supérieur quand les clips deviennent essentiels.",
    step1Body: "OAuth sécurisé connecte ton compte créateur.",
    step1Title: "Connecte Twitch",
    step2Body: "Choisis les chaînes Twitch qu’AutoClipR doit surveiller.",
    step2Title: "Ajoute tes streamers",
    step3Body: "Les commandes chat et déclencheurs API créent et sauvegardent les clips.",
    step3Title: "Crée des clips automatiquement"
  },
  pricing: {
    businessDescription: "Pour les équipes et agences.",
    freeDescription: "Pour tester le workflow.",
    manualClips: "Clips manuels",
    multiChannelSupport: "Support multi-chaînes",
    oneStreamerTarget: "Un streamer cible",
    popular: "Populaire",
    priorityCapacity: "Capacité prioritaire",
    proDescription: "Pour les streamers actifs."
  },
  faq: {
    answer1:
      "Oui. En production, AutoClipR utilise l’API officielle Twitch Helix Create Clip.",
    answer2:
      "Oui, si Twitch autorise ton compte connecté à créer des clips pour cette chaîne.",
    answer3:
      "Oui. Le worker Railway continue d’écouter le chat Twitch pour les commandes.",
    question1: "AutoClipR crée-t-il de vrais clips Twitch ?",
    question2: "Puis-je clipper un autre streamer ?",
    question3: "Le worker chat doit-il rester en ligne ?",
    title: "FAQ"
  },
  login: {
    automation: "Automatisation des commandes chat",
    connectWithTwitch: "Se connecter avec Twitch",
    continueWithTwitch: "Continuer avec Twitch",
    demoMode: "Mode démo",
    enterDemo: "Entrer dans la démo",
    heroBody:
      "Connecte Twitch, configure tes streamers et laisse le worker chat transformer les commandes en clips Twitch officiels.",
    heroTitle: "Crée des clips depuis les moments que ton chat voit déjà.",
    oauth: "OAuth officiel",
    scope: "Scope clips:edit",
    secureSignIn: "Connexion sécurisée",
    twitchOauth:
      "AutoClipR utilise Twitch OAuth pour vérifier ton identité, créer des clips officiels et autoriser le worker chat.",
    whatHappensNext: "Que se passe-t-il ensuite ?",
    whatHappensNextBody:
      "Tu arriveras dans ton dashboard pour ajouter des streamers, configurer les règles du bot et créer ton premier vrai clip Twitch."
  },
  dashboard: {
    activityFeed: "Activité récente",
    activityFeedDescription: "Signaux d’automatisation de ce mois-ci.",
    activeStreamers: "Streamers actifs",
    aiDetection: "Détection IA",
    matchedAudioEvents: "{count} événement(s) de mots-clés audio détecté(s)",
    allSavedClipRequests: "Toutes les demandes de clips sauvegardées.",
    botStatus: "Statut du bot",
    chatCommandClips: "Clips par commande chat",
    commandTriggeredClipsThisMonth: "{count} clips déclenchés par commande ce mois-ci",
    currentBillingUsage: "Usage de la période de facturation actuelle.",
    currentMonthlyRatio: "Ratio prêts/échoués sur le mois en cours.",
    description:
      "Surveille l’automatisation de tes clips Twitch, les streamers actifs et les règles du bot depuis un centre de commande.",
    estimatedTwoMinutes: "Estimé à 2 minutes gagnées par clip.",
    hoursSaved: "Heures gagnées",
    clipsThisMonth: "Clips ce mois-ci",
    connectedChannels: "{count} chaîne(s) configurée(s)",
    noRuleReconnect:
      "Reconnecte ton compte Twitch pour créer la règle Bot par défaut.",
    online: "En ligne",
    streamerTargets: "Streamers ciblés",
    title: "Bon retour",
    totalClips: "Clips totaux",
    channelsMonitored: "Chaînes surveillées par le worker chat.",
    workerListens: "Le worker écoute quand il est déployé et que la règle est active."
  },
  onboarding: {
    addStreamer: "Ajouter ton premier streamer",
    addStreamerDescription:
      "Choisis la première chaîne Twitch que le worker chat doit surveiller.",
    completed: "Terminé",
    completeMessage: "AutoClipR est entièrement configuré.",
    configureCommand: "Configurer la commande",
    connectTwitch: "Connecter Twitch",
    connectTwitchDescription:
      "Autorise AutoClipR avec Twitch pour créer des clips de façon sécurisée.",
    createFirstClip: "Créer ton premier clip",
    createFirstClipDescription:
      "Lance un clip manuel pour confirmer que la création Twitch fonctionne de bout en bout.",
    description:
      "Termine ces étapes pour valider ton workflow de clips avant de l’utiliser en live.",
    openApiTrigger: "Ouvrir le trigger API",
    progress: "{completed}/{total} terminé(s)",
    testApiTrigger: "Tester un déclencheur API",
    testApiTriggerDescription:
      "Utilise une clé de déclenchement externe depuis une card streamer pour créer un clip.",
    testChatCommand: "Tester une commande chat",
    testChatCommandDescription:
      "Envoie ta commande configurée dans le chat et vérifie qu’AutoClipR sauvegarde le clip.",
    title: "Démarrage"
  },
  analytics: {
    analytics: "Analytics",
    aiVoiceSoon: "Voix IA bientôt",
    audioKeywords: "Mots-clés audio",
    chatCommands: "Commandes chat",
    currentMonthlyPeriod: "Période mensuelle actuelle.",
    failedClips: "Clips échoués",
    manual: "Manuel",
    readyClips: "Clips prêts",
    successRate: "Taux de succès",
    success: "{rate}% succès"
  },
  usage: {
    aiVoiceDetection: "Détection vocale IA",
    clips: "Clips",
    monthlyLimits: "Limites mensuelles du plan actuel.",
    title: "Utilisation",
    voiceComingSoon:
      "Les clips déclenchés par la voix sont prévus mais pas encore disponibles."
  },
  clips: {
    createManualDescription:
      "Consulte les clips Twitch existants et crée un clip manuel quand quelque chose arrive hors automatisation chat.",
    info:
      "AutoClipR stocke le statut des clips Twitch, les messages d’erreur et les liens d’édition pour comprendre chaque déclenchement.",
    latestRequests: "Dernières demandes de clips Twitch et résultats.",
    library: "Bibliothèque de clips",
    noClipsDescription:
      "Crée un clip manuel ou déclenche-en un depuis le chat Twitch pour le voir ici.",
    noClipsTitle: "Aucun clip pour le moment",
    recent: "Clips récents"
  },
  createClip: {
    button: "Créer un clip Twitch",
    channelLabel: "Chaîne Twitch à clipper",
    connectedHint:
      "Twitch peut refuser la demande si la chaîne est hors ligne, si les clips sont désactivés ou si ton compte ne peut pas clipper cette chaîne.",
    description: "Déclenche un clip Twitch Helix manuel.",
    disabledHint: "Connecte ton profil Twitch avant de créer des clips.",
    optionalTitle: "Titre optionnel",
    placeholderTitle: "Meilleur moment du stream",
    title: "Créer un clip"
  },
  download: {
    preparing: "Préparation du téléchargement...",
    reconnect: "Reconnecte Twitch pour activer les téléchargements"
  },
  streamers: {
    addStreamer: "Ajouter un streamer",
    apiTriggerKey: "Clé de déclenchement API",
    chooseChannels: "Choisir les chaînes à surveiller",
    confirmRemove: "Supprimer ce streamer d’AutoClipR ?",
    description:
      "Ajoute les streamers Twitch dont le chat doit être écouté par le worker pour les commandes !clip et les déclencheurs externes.",
    emptyDescription:
      "Ajoute un login Twitch pour permettre à AutoClipR d’écouter les commandes et créer des clips.",
    emptyTitle: "Aucun streamer configuré",
    listensToChannels: "Le worker chat écoute ces chaînes Twitch.",
    regenerateKey: "Régénérer la clé",
    streamersCount: "{count}/{limit} streamers",
    workerBehavior: "Comportement du worker",
    workerBehaviorBody:
      "Le worker chat Railway rafraîchit les streamers configurés, rejoint les nouvelles chaînes Twitch et quitte automatiquement les chaînes supprimées."
  },
  rules: {
    active: "Actif",
    addNumber: "Ajouter un numéro",
    aiDetectionInstruction: "Instruction de détection IA",
    automaticNumbering: "Numérotation automatique",
    botRules: "Règles du bot",
    chatCommand: "Commande chat",
    clipDuration: "Durée du clip",
    cooldown: "Cooldown",
    controlCommand: "Contrôle ta commande chat",
    description:
      "Choisis la commande, le cooldown, les permissions, le nom des clips et les mots-clés IA utilisés par AutoClipR.",
    globalClipName: "Nom global du clip",
    instructionHint:
      "AutoClipR sauvegarde cette instruction maintenant. La détection vocale n’est pas encore active.",
    keywords: "Mots-clés",
    keywordsHint:
      "Ces mots-clés sont disponibles pour les règles chat aujourd’hui et la détection vocale plus tard.",
    nextNumber: "Prochain numéro",
    notifications: "Notifications",
    notifyOnCreate: "Notifier quand un clip est créé",
    permission: "Qui peut utiliser cette commande ?",
    recommendedSetup: "Configuration recommandée",
    recommended1:
      "Garde une commande courte, mémorable et préfixée par un point d’exclamation.",
    recommended2:
      "Utilise un cooldown pour éviter les clips doublons pendant les moments intenses.",
    recommended3:
      "Limite l’usage aux modérateurs si tu veux un contrôle précis pendant les lives.",
    save: "Enregistrer la règle"
  },
  permissions: {
    EVERYONE: "Tout le monde",
    MODERATORS: "Modérateurs",
    STREAMER_ONLY: "Streamer seulement",
    SUBSCRIBERS: "Abonnés"
  },
  ai: {
    configuredMatches: "Mots-clés configurés détectés",
    currentSignal: "Signal actuel",
    description:
      "Les clips déclenchés par la voix arrivent bientôt. Les mots-clés sont déjà sauvegardés pour préparer le workflow.",
    noRule: "Aucune règle",
    speechEnginePlanned:
      "Le moteur speech-to-text est prévu comme couche modulaire pour Whisper, Deepgram ou un autre fournisseur. Il n’est pas encore actif.",
    title: "Détection vocale IA",
    voiceTriggeredClips: "Clips déclenchés par la voix"
  },
  billing: {
    billing: "Facturation",
    choosePlan: "Consulte ton usage et choisis le plan adapté à ton volume de clips Twitch.",
    clipsPerMonth: "{count} clips/mois",
    current: "Actuel",
    freeProBusiness: "Plans Free, Pro et Business.",
    manageSubscription: "Gérer l’abonnement",
    streamersLimit: "{count} streamers",
    upgradeTo: "Passer à {plan}"
  },
  trial: {
    badge: "Essai 7 jours",
    endsIn: "L’essai Pro se termine dans {days} {unit}",
    endsOn: "Fin de l’essai le {date}.",
    day: "jour",
    days: "jours"
  },
  settings: {
    accountSettings: "Paramètres du compte",
    autoClipRole: "Rôle AutoClipR",
    created: "Créé",
    description:
      "Consulte le compte Twitch connecté à AutoClipR et l’identité de ton workspace.",
    email: "Email",
    login: "Login",
    name: "Nom",
    notProvided: "Non renseigné",
    plan: "Plan",
    twitchAccount: "Compte Twitch",
    twitchAccountFallback: "Compte Twitch",
    twitchAccountHint: "Profil OAuth utilisé pour les clips et le chat.",
    twitchUserId: "ID utilisateur Twitch",
    workspace: "Workspace"
  },
  support: {
    askQuestion: "Poser une question",
    askQuestionDescription:
      "Pour une question produit, de l’aide à la configuration ou un partenariat, envoie-nous un message.",
    description:
      "Obtiens de l’aide pour la configuration, les permissions Twitch, la création de clips ou la facturation.",
    emailQuestions: "Email questions",
    emailSupport: "Email support",
    needHelp: "Besoin d’aide ?",
    needHelpDescription:
      "Ouvre un ticket support ou rejoins Discord pour obtenir une aide plus rapide de l’équipe AutoClipR.",
    openDiscord: "Ouvrir Discord",
    openTicket: "Ouvrir un ticket",
    title: "Support",
    trustDescription:
      "Ne partage pas de tokens Twitch, clés API trigger ou données de facturation privées dans les salons publics.",
    trustTitle: "Support sécurisé"
  },
  actions: {
    enterValidTwitchLogin: "Entre un login Twitch valide.",
    streamerAdded: "Streamer ajouté.",
    upgradeForMoreStreamers:
      "Passe à un plan supérieur pour ajouter plus de streamers."
  }
} as const;
