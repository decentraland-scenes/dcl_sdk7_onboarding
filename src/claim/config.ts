export type ClaimConfigInstType = {
  campaign: string
  campaignKeys: Record<string, string>
}

export const USE_CAPTCHA: boolean = false

export type ClaimTokenRequestArgs = {
  claimServer: string
  campaign: string
  campaign_key: string
}
export const configEmote: ClaimTokenRequestArgs = {
  claimServer: 'https://rewards.decentraland.org',
  campaign: '2d9f5517-e513-4b9e-bab5-0d46ba2ad614',
  campaign_key:
    '+LsKlzkXTumoP4dLjQ4Csi2fVRflE0ueurUNRroq1hQ=.rsTrxYpUUyeauWrt5oRDv2dgQ8NFa45em2M8gHzsYt8='
}

export const configVest: ClaimTokenRequestArgs = {
  claimServer: 'https://rewards.decentraland.org',
  campaign: '2d9f5517-e513-4b9e-bab5-0d46ba2ad614',
  campaign_key:
    'E1HS5p11S3SNAjK2ThRuGi2fVRflE0ueurUNRroq1hQ=.fG2nut7UFx78MRgHx5coLyrvlsYPKpgW7LPJc6trqX8='
}
export const configCap: ClaimTokenRequestArgs = {
  claimServer: 'https://rewards.decentraland.org',
  campaign: '2d9f5517-e513-4b9e-bab5-0d46ba2ad614',
  campaign_key:
    'NYpZP1GXQlePsRIiYvvNgS2fVRflE0ueurUNRroq1hQ=.m04oze9kbuXZLkydR1fyF3Cja+MCpXMm64HNYGLeVwE='
}
