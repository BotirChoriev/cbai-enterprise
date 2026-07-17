/** BUILD-034 — Organization workspace UI copy (Русский). */

export const ORG_WORKSPACE_RU = {
  pageEyebrow: "ОС организации",
  persistenceSharedReady:
    "Общий backend настроен. Записи организации синхронизируются через Supabase с RLS при входе.",
  persistenceMisconfigured:
    "Общий backend настроен неполностью — данные организации остаются только на устройстве.",
  persistenceDeviceLocal:
    "Общий backend не настроен — данные организации только на устройстве. Мультипользовательская работа требует Supabase.",
  inviteTokenPresent:
    "Токен приглашения присутствует — примите с учётной записи, соответствующей приглашённому email, на этом устройстве.",
  createHeading: "Создать организацию",
  identityWarning:
    'Только пользовательское рабочее пространство. Название «NASA», «ВОЗ» или другой реальной организации не подтверждает официальное представительство.',
  nameLabel: "Название",
  typeLabel: "Тип",
  createButton: "Создать организацию",
  nameRequired: "Требуется название организации.",
  orgCreated:
    'Организация «{name}» создана. Это пользовательское рабочее пространство — не официально верифицированное учреждение.',
  memberCount: "{count} участник(ов)",
  missionsLabel: "Миссии",
  missionsLinked: "Связано через контекст миссии",
  membersLabel: "Участники",
  pendingInvitesLabel: "Ожидающие приглашения",
  inviteHeading: "Пригласить участника",
  emailLabel: "Email",
  createInviteLink: "Создать ссылку приглашения",
  emailNotSent: "Email-транспорт не подключён — только ссылка приглашения.",
  inviteCreated: "Приглашение создано. Email не отправлен — скопируйте ссылку: {link}",
  auditHeading: "Аудит",
  workspaceOrganization: "workspace_organization",
} as const;
