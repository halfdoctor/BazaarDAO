export enum RoutePaths {
  dashboard = '/',

  governance = '/governance',
  governanceTab = '/governance/:tab?',
  votingPower = '/governance/voting-power',
  qProposals = '/governance/q-proposals',
  expertProposals = '/governance/expert-proposals',

  proposal = '/governance/proposal/:contract?/:id?',

  newQProposal = '/governance/q-proposals/new',
  newExpertProposal = '/governance/expert-proposals/new',

  qParameters = '/q-parameters',
  qDefiRiskExpertPanelParameters = '/q-parameters/defi-risk-experts',
  qRootNodeSelectionExpertPanelParameters = '/q-parameters/root-node-selection-experts',
  qFeesAndIncentivesExpertPanel = '/q-parameters/fees-and-incentives-experts',
  qContractRegistry = '/q-parameters/contract-registry',
  qConstitution = '/q-parameters/constitution',

  qVault = '/q-vault',
}
