/** BUILD-034 — Organization workspace UI copy (Türkçe). */

export const ORG_WORKSPACE_TR = {
  pageEyebrow: "Organizasyon OS",
  persistenceSharedReady:
    "Paylaşılan backend yapılandırıldı. Organizasyon kayıtları oturum açıldığında Supabase RLS ile senkronize edilir.",
  persistenceMisconfigured:
    "Paylaşılan backend eksik yapılandırıldı — organizasyon verileri yalnızca cihazda kalır.",
  persistenceDeviceLocal:
    "Paylaşılan backend yapılandırılmadı — organizasyon verileri yalnızca cihazda. Çok kullanıcılı işbirliği Supabase gerektirir.",
  inviteTokenPresent:
    "Davet tokeni mevcut — davet edilen e-postayla eşleşen hesaptan bu cihazda kabul edin.",
  createHeading: "Organizasyon oluştur",
  identityWarning:
    'Yalnızca kullanıcı tarafından oluşturulan çalışma alanı. "NASA", "WHO" veya başka gerçek kurum adı resmi temsilciliği doğrulamaz.',
  nameLabel: "Ad",
  typeLabel: "Tür",
  createButton: "Organizasyon oluştur",
  nameRequired: "Organizasyon adı gerekli.",
  orgCreated:
    'Organizasyon "{name}" oluşturuldu. Bu bir kullanıcı çalışma alanıdır — resmi doğrulanmış kurum değil.',
  memberCount: "{count} üye",
  missionsLabel: "Misyonlar",
  missionsLinked: "Misyon bağlamı üzerinden bağlı",
  membersLabel: "Üyeler",
  pendingInvitesLabel: "Bekleyen davetler",
  inviteHeading: "Üye davet et",
  emailLabel: "E-posta",
  createInviteLink: "Davet bağlantısı oluştur",
  emailNotSent: "E-posta taşıması bağlı değil — yalnızca davet bağlantısı.",
  inviteCreated: "Davet oluşturuldu. E-posta gönderilmedi — bağlantıyı kopyalayın: {link}",
  auditHeading: "Denetim",
  workspaceOrganization: "workspace_organization",
} as const;
