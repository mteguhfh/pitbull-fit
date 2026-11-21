import { Exercise } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    defaultRestSeconds: 120,
    videoEmbedId: 'rT7DgCr-3pg',
    tempo: '3-1-1-0',
    tips: ['Keep wrists stacked over elbows', 'Drive feet through the ground', 'Retract scapula before unracking'],
    instructions: [
      'Lie flat on the bench with eyes under the bar.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack, take a deep breath, and lower bar smoothly to mid-chest.',
      'Press upward explosively while keeping feet driven into the floor.'
    ]
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    defaultRestSeconds: 90,
    videoEmbedId: '0G2_XX7435M',
    tempo: '3-0-1-0',
    tips: ['Set bench angle to 30-45 degrees', 'Keep elbows at a 45 degree angle', 'Touch dumbbells softly at top'],
    instructions: [
      'Set bench to 30-45 degree incline.',
      'Kick dumbbells up to shoulder level.',
      'Press up over upper chest with controlled elbow flare.',
      'Lower under tension until dumbbells touch chest level.'
    ]
  },
  {
    id: 'dips',
    name: 'Chest / Tricep Dips',
    category: 'chest',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: 'bodyweight',
    defaultRestSeconds: 90,
    videoEmbedId: '2z8JmcrW-As',
    tempo: '2-1-1-0',
    tips: ['Lean forward 15° to focus chest', 'Go down until upper arms are parallel', 'Avoid shrugging shoulders'],
    instructions: [
      'Grip parallel bars and lock elbows at top.',
      'Lean slightly forward to bias chest, or keep upright for triceps.',
      'Lower until upper arms are parallel to floor.',
      'Press back up to full extension.'
    ]
  },
  {
    id: 'cable-crossover',
    name: 'Cable Fly / Crossover',
    category: 'chest',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    equipment: 'cable',
    defaultRestSeconds: 60,
    videoEmbedId: 'taI4XduLp4M',
    tempo: '2-1-1-1',
    tips: ['Slight bend in elbows throughout', 'Squeeze chest hard at crossover', 'Controlled eccentric stretch'],
    instructions: [
      'Set pulleys to chest height.',
      'Step forward into a staggered stance with slight forward lean.',
      'Bring hands together in a hugging motion with slight elbow bend.',
      'Squeeze chest at peak contraction and return with deep stretch.'
    ]
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press (OHP)',
    category: 'shoulders',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'traps', 'upper-back'],
    equipment: 'barbell',
    defaultRestSeconds: 120,
    videoEmbedId: '2yjwXTZQDDI',
    tempo: '2-0-1-0',
    tips: ['Brace core and squeeze glutes', 'Move head through once bar clears forehead', 'Straight vertical bar path'],
    instructions: [
      'Clean or unrack bar onto front deltoids and clavicle.',
      'Squeeze glutes and brace core tightly.',
      'Press bar vertically overhead in a straight path, moving head back slightly.',
      'Lock out with head through the window at top.'
    ]
  },
  {
    id: 'lateral-raises',
    name: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    equipment: 'dumbbell',
    defaultRestSeconds: 60,
    videoEmbedId: '3VcKaXpzqRo',
    tempo: '2-1-1-0',
    tips: ['Lead with elbows not wrists', 'Slight lean forward', 'Stay within scaption plane'],
    instructions: [
      'Stand upright holding dumbbells at sides.',
      'Lead with elbows and raise arms out to sides until parallel to floor.',
      'Pause for a fraction of a second at shoulder height.',
      'Lower slowly under control without swinging.'
    ]
  },
  {
    id: 'face-pulls',
    name: 'Cable Face Pull',
    category: 'shoulders',
    primaryMuscles: ['shoulders', 'traps'],
    secondaryMuscles: ['upper-back'],
    equipment: 'cable',
    defaultRestSeconds: 60,
    videoEmbedId: 'rep-qVOkqgk',
    tempo: '2-1-1-1',
    tips: ['Pull toward eye level', 'Externally rotate elbows backward', 'Target rear delts and lower traps'],
    instructions: [
      'Attach rope to upper pulley.',
      'Pull toward eye level while spreading hands apart.',
      'Rotate shoulders backward externally at end range.',
      'Hold contraction for 1 second to strengthen rear delts.'
    ]
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell Deadlift',
    category: 'back',
    primaryMuscles: ['back', 'hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'traps', 'forearms'],
    equipment: 'barbell',
    defaultRestSeconds: 180,
    videoEmbedId: 'op9kVnSso6Q',
    tempo: '2-1-1-0',
    tips: ['Bar positioned over midfoot', 'Engage lats to keep bar close to shins', 'Drive floor away with legs'],
    instructions: [
      'Stand with mid-foot under barbell with hip-width stance.',
      'Hinge at hips and grip bar just outside knees.',
      'Pull chest up, engage lats, and pull slack out of the bar.',
      'Drive floor away with legs until standing tall at lockout.'
    ]
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    category: 'back',
    primaryMuscles: ['back', 'lats'],
    secondaryMuscles: ['biceps', 'shoulders', 'lower_back'],
    equipment: 'barbell',
    defaultRestSeconds: 90,
    videoEmbedId: 'FWJR5Ve8gkQ',
    tempo: '2-1-1-0',
    tips: ['Hinge torso to 45 degrees', 'Pull elbows back past ribs', 'Keep neck in neutral alignment'],
    instructions: [
      'Hinge at hips until torso is roughly 45 degrees to floor.',
      'Pull bar toward lower abdomen / belly button.',
      'Retract scapulae and squeeze back at top of motion.',
      'Lower bar with control without losing spinal posture.'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'back'],
    equipment: 'cable',
    defaultRestSeconds: 75,
    videoEmbedId: 'CAwf7n6Luuc',
    tempo: '3-0-1-1',
    tips: ['Depress shoulder blades before pulling', 'Pull bar to collarbone', 'Full stretch at top'],
    instructions: [
      'Sit facing machine with knees secured under pads.',
      'Grip wide bar with overhand grip.',
      'Pull bar down to upper chest while depressing shoulder blades.',
      'Control the return to get a full lat stretch at top.'
    ]
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups / Chin-Ups',
    category: 'back',
    primaryMuscles: ['lats', 'back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'bodyweight',
    defaultRestSeconds: 90,
    videoEmbedId: 'eGo4IYlbE5g',
    tempo: '2-0-1-1',
    tips: ['Initiate pull with back, not arms', 'Chest up towards the bar', 'Full dead-hang stretch at bottom'],
    instructions: [
      'Hang from bar with hands slightly wider than shoulder-width.',
      'Pull body up until chin clears the bar.',
      'Keep chest elevated and avoid excessive kipping.',
      'Lower all the way to a dead hang.'
    ]
  },
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'lower_back', 'adductors'],
    equipment: 'barbell',
    defaultRestSeconds: 150,
    videoEmbedId: 'bEv6CCg2BC8',
    tempo: '3-1-1-0',
    tips: ['Knees track over toes', 'Brace core with deep breath', 'Hit parallel depth or lower'],
    instructions: [
      'Rest bar securely on upper traps (high bar) or rear delts (low bar).',
      'Set feet shoulder-width apart, toes angled out slightly.',
      'Break at hips and knees together, descending until hips pass below knees.',
      'Drive powerfully out of the hole, keeping chest proud.'
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'legs',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'forearms'],
    equipment: 'barbell',
    defaultRestSeconds: 120,
    videoEmbedId: '_oyxCn2iSjU',
    tempo: '3-1-1-0',
    tips: ['Hips push back with soft knees', 'Keep bar glued against shins', 'Stop when hips stop traveling backward'],
    instructions: [
      'Stand holding barbell with soft knees.',
      'Push hips back while keeping bar gliding against thighs and shins.',
      'Feel a deep stretch in hamstrings without rounding lower spine.',
      'Drive hips forward to return to standing position.'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'calves'],
    equipment: 'machine',
    defaultRestSeconds: 90,
    videoEmbedId: 'IZxyjW7MPJQ',
    tempo: '3-0-1-0',
    tips: ['Do not aggressively hyperextend knees', 'Keep lower back pinned to backrest', 'Feet shoulder width on plate'],
    instructions: [
      'Sit comfortably in sled machine with feet hip-width on footplate.',
      'Release safety handles and lower sled until knees reach 90 degrees.',
      'Press through full foot back up without aggressively locking knees.'
    ]
  },
  {
    id: 'leg-curl',
    name: 'Hamstring Leg Curl',
    category: 'legs',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    equipment: 'machine',
    defaultRestSeconds: 60,
    videoEmbedId: 'ELOCsoDSmrg',
    tempo: '2-1-1-1',
    tips: ['Dorsiflex toes for hamstring recruitment', 'Do not lift hips off pad', 'Slow 2-second negative'],
    instructions: [
      'Adjust pad to sit just behind Achilles tendon.',
      'Curl weight toward glutes, flexing hamstrings hard.',
      'Slowly lower back down under 2-second negative.'
    ]
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'legs',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    equipment: 'machine',
    defaultRestSeconds: 60,
    videoEmbedId: 'YyvSfV-YXQQ',
    tempo: '2-1-1-1',
    tips: ['Pause 1 second at full extension', 'Control descent without slamming weights', 'Align knees with machine fulcrum'],
    instructions: [
      'Sit with back against pad and roller on lower shins.',
      'Extend knees until legs are straight, squeezing quadriceps.',
      'Control eccentric portion back down.'
    ]
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    category: 'legs',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    defaultRestSeconds: 60,
    videoEmbedId: 'gwLzBJYoWlI',
    tempo: '3-2-1-1',
    tips: ['Full 2s deep stretch at bottom', 'Explode up onto balls of feet', 'Hold peak contraction for 1 second'],
    instructions: [
      'Position balls of feet on block with heels hanging off.',
      'Lower heels deep for a full stretch at bottom.',
      'Drive onto balls of feet as high as possible and pause for 1 second.'
    ]
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Bicep Curl',
    category: 'arms',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'barbell',
    defaultRestSeconds: 60,
    videoEmbedId: 'kwG2ipFRgfo',
    tempo: '3-0-1-1',
    tips: ['Elbows locked to sides of torso', 'Zero momentum or lower back swing', 'Full peak squeeze at top'],
    instructions: [
      'Stand tall with underhand grip on barbell.',
      'Curl bar up toward shoulders while keeping elbows pinned to ribs.',
      'Squeeze biceps peak contraction, then lower slowly.'
    ]
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    category: 'arms',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    defaultRestSeconds: 60,
    videoEmbedId: 'soxrZlIl35U',
    tempo: '3-0-1-1',
    tips: ['Incline bench at 45 degrees', 'Full arm extension at bottom', 'Supinate palms upward through curl'],
    instructions: [
      'Lie back on 45-degree incline bench with arms hanging.',
      'Curl dumbbells simultaneously, supinating wrists at top.',
      'Enjoy deep stretch on long head of bicep at bottom.'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    category: 'arms',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'cable',
    defaultRestSeconds: 60,
    videoEmbedId: '2-LAMcpzODU',
    tempo: '2-1-1-1',
    tips: ['Keep elbows motionless by sides', 'Lock triceps out forcefully at bottom', 'Resist the weight back to 90 degrees'],
    instructions: [
      'Grip straight bar or rope at chest height.',
      'Keep elbows tucked by sides and push down until arms are locked.',
      'Hold squeeze at bottom and return with controlled tempo.'
    ]
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher (Lying Tricep Ext)',
    category: 'arms',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: 'barbell',
    defaultRestSeconds: 75,
    videoEmbedId: 'd_KZxkY_0cM',
    tempo: '3-0-1-0',
    tips: ['Upper arms tilted slightly back', 'Bend only at elbow joints', 'Lower bar towards crown of head'],
    instructions: [
      'Lie on flat bench with EZ bar extended above chest.',
      'Hinge at elbows to lower bar toward forehead or crown of head.',
      'Extend elbows back to starting position without flaring.'
    ]
  },
  {
    id: 'cable-crunch',
    name: 'Cable Kneeling Crunch',
    category: 'core',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques'],
    equipment: 'cable',
    defaultRestSeconds: 60,
    videoEmbedId: '2fORO4v1r4A',
    tempo: '2-1-1-1',
    tips: ['Curl spine downward like a shrimp', 'Do not sit back onto heels', 'Hold crunch contraction 1 second'],
    instructions: [
      'Kneel in front of cable with rope held beside ears.',
      'Flex spine downward, bringing elbows towards thighs.',
      'Keep hips static and curl with abdominal contraction.'
    ]
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    category: 'core',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['forearms'],
    equipment: 'bodyweight',
    defaultRestSeconds: 60,
    videoEmbedId: 'Pr1ieGZ5tkQ',
    tempo: '2-1-1-0',
    tips: ['Posterior pelvic tilt initiates lift', 'Avoid swinging or using momentum', 'Slow controlled return to dead hang'],
    instructions: [
      'Hang from pull-up bar with arms extended.',
      'Raise legs or knees up towards chest by curling pelvis upward.',
      'Lower slowly without swinging back and forth.'
    ]
  }
];

export const INITIAL_ROUTINES = [
  {
    id: 'push-day',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    description: 'Hypertrophy focused upper body pressing routine.',
    split: 'push' as const,
    exercises: [
      { exerciseId: 'bench-press', defaultSets: 4, targetReps: '6-8' },
      { exerciseId: 'incline-dumbbell-press', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'overhead-press', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'lateral-raises', defaultSets: 4, targetReps: '12-15' },
      { exerciseId: 'tricep-pushdown', defaultSets: 3, targetReps: '10-12' }
    ]
  },
  {
    id: 'pull-day',
    name: 'Pull Day (Back, Biceps, Rear Delts)',
    description: 'Heavy back builder and arm growth session.',
    split: 'pull' as const,
    exercises: [
      { exerciseId: 'barbell-deadlift', defaultSets: 3, targetReps: '5' },
      { exerciseId: 'lat-pulldown', defaultSets: 4, targetReps: '8-10' },
      { exerciseId: 'barbell-row', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'face-pulls', defaultSets: 3, targetReps: '12-15' },
      { exerciseId: 'barbell-curl', defaultSets: 3, targetReps: '10-12' },
      { exerciseId: 'incline-dumbbell-curl', defaultSets: 3, targetReps: '12' }
    ]
  },
  {
    id: 'leg-day',
    name: 'Legs & Core (Quads, Hamstrings, Calves)',
    description: 'Comprehensive lower body strength and mass routine.',
    split: 'legs' as const,
    exercises: [
      { exerciseId: 'barbell-squat', defaultSets: 4, targetReps: '6-8' },
      { exerciseId: 'romanian-deadlift', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'leg-press', defaultSets: 3, targetReps: '10-12' },
      { exerciseId: 'leg-curl', defaultSets: 3, targetReps: '12' },
      { exerciseId: 'standing-calf-raise', defaultSets: 4, targetReps: '15' },
      { exerciseId: 'hanging-leg-raise', defaultSets: 3, targetReps: '12-15' }
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body Power',
    description: 'Full upper torso development workout.',
    split: 'upper' as const,
    exercises: [
      { exerciseId: 'bench-press', defaultSets: 4, targetReps: '6-8' },
      { exerciseId: 'pull-ups', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'overhead-press', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'barbell-row', defaultSets: 3, targetReps: '8-10' },
      { exerciseId: 'dips', defaultSets: 3, targetReps: '10' }
    ]
  }
];
