import { Subject } from './schema';

const subjectRoutes: Record<Subject, string> = {
  [Subject.DASHBOARD]: '/dashboard',
  [Subject.LIGHTMAP]: '/map',
  [Subject.IVS_SURVEILLANCE]: '/surveillance',
  [Subject.IVS_EVENTS]: '/events',
  [Subject.WIFI]: '/wifi',
  // [Subject.WIFI_ADVERTISEMENT]: '/advertisement',
  [Subject.DEVICE]: '/device',
  [Subject.GROUP]: '/division',
  [Subject.USER]: '/user',
  [Subject.RECYCLE_BIN]: '/recycle-bin',
  [Subject.ROLE_TEMPLATE]: '/role',
  [Subject.ELASTIC_SEARCH]: '/elastic-search',
  [Subject.ABNORMAL_MANAGEMENT]: '/abnormal',
  // [Subject.MAINTENANCE_STAFF]: '/maintenance_staff',
  [Subject.INFO]: '/info',
  [Subject.INDOOR]: '/indoor',
  [Subject.AUTOMATION_RULE_MANAGEMENT]: '/rule-management',
  [Subject.SAMPLE]: '/sample',
  [Subject.ESIGNAGE]: '/esignage',
};

export default subjectRoutes;
