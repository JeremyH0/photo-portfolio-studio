import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ludvuc61',
    dataset: 'production'
  },
  studioHost: 'photo-portfolio-ludvuc61',
  deployment: {
    appId: 'ft6i3ywduubonvpvp0and0mi',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
