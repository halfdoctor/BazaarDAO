export enum RoutePaths {
  dashboard = '/',

  governance = '/governance',
  governanceTab = '/governance/:tab?',
  qProposals = '/governance/q-proposals',
  expertProposals = '/governance/expert-proposals',

  proposal = '/governance/proposal/:contract?/:id?',

  newQProposal = '/governance/q-proposals/new',
  newExpertProposal = '/governance/expert-proposals/new',

  parameters = '/parameters',
  qDefiRiskExpertPanelParameters = '/parameters/defi-risk-experts',
  qRootNodeSelectionExpertPanelParameters = '/parameters/root-node-selection-experts',
  qFeesAndIncentivesExpertPanel = '/parameters/fees-and-incentives-experts',
  qContractRegistry = '/parameters/contract-registry',
  qConstitution = '/parameters/constitution',

  votingPower = '/voting-power',
}
