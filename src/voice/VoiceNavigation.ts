export enum VoiceIntent {
  OPEN_GAMES = 'OPEN_GAMES',
  OPEN_DASHBOARD = 'OPEN_DASHBOARD',
  OPEN_MANAGE_DATA = 'OPEN_MANAGE_DATA',
  OPEN_REMINDERS = 'OPEN_REMINDERS',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  OPEN_PROFILE = 'OPEN_PROFILE',
  OPEN_CHATBOT = 'OPEN_CHATBOT',
  OPEN_DAILY_ROUTINE = 'OPEN_DAILY_ROUTINE',
  OPEN_WHO_IS_THIS = 'OPEN_WHO_IS_THIS',
  OPEN_SPOT_THE_DIFFERENCE = 'OPEN_SPOT_THE_DIFFERENCE',
  OPEN_COLOR_SEQUENCE = 'OPEN_COLOR_SEQUENCE',
  GO_BACK = 'GO_BACK',
  GO_HOME = 'GO_HOME',
  UNKNOWN_COMMAND = 'UNKNOWN_COMMAND',
}

export interface IntentResult {
  type: VoiceIntent;
  route: string | null;
  label: string;
}

export function resolveNavigation(
  intent: IntentResult,
  navigate: (to: string | number) => void
): void {
  switch (intent.type) {
    case VoiceIntent.OPEN_GAMES:
    case VoiceIntent.GO_HOME:
      navigate('/');
      break;
    case VoiceIntent.GO_BACK:
      navigate(-1);
      break;
    case VoiceIntent.UNKNOWN_COMMAND:
      break;
    default:
      if (intent.route) navigate(intent.route);
      break;
  }
}
