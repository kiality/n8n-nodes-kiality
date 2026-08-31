import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

// Reflète Kiality.Domain.Enums.AnomalySeverityEnum (Kiality-sln/Kiality.Domain/Enums/AnomalySeverityEnum.cs) -
// l'API attend l'ordinal (int), pas le nom.
const SEVERITY_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Critical', value: 0 },
	{ name: 'High', value: 1 },
	{ name: 'Medium', value: 2 },
	{ name: 'Low', value: 3 },
];

// Reflète Kiality.Domain.Enums.SourceTypeEnum.
const SOURCE_TYPE_OPTIONS: INodePropertyOptions[] = [
	{ name: 'ERP', value: 0 },
	{ name: 'CRM', value: 1 },
	{ name: 'ITSM', value: 2 },
	{ name: 'PPM', value: 3 },
	{ name: 'Custom', value: 4 },
	{ name: 'IAM', value: 5 },
];

// Statuts qu'un appelant externe peut définir manuellement (Detected/Prevention sont réservés
// au worker Kiality - voir Kiality.Worker/Services/AnomalyFactory.cs).
const STATUS_OPTIONS: INodePropertyOptions[] = [
	{ name: 'Investigating', value: 'Investigating' },
	{ name: 'Resolved', value: 'Resolved' },
	{ name: 'False Positive', value: 'FalsePositive' },
	{ name: 'Suppressed', value: 'Suppressed' },
];

export class Kiality implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kiality',
		name: 'kiality',
		icon: 'file:kiality.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Créer, mettre à jour et consulter les anomalies et normes Kiality',
		defaults: { name: 'Kiality' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'kialityApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Anomaly', value: 'anomaly' },
					{ name: 'Standard', value: 'standard' },
				],
				default: 'anomaly',
			},

			// ── Anomaly : opérations ──────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['anomaly'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create an anomaly',
						description: 'Signale une nouvelle anomalie sur une norme donnée',
						routing: { request: { method: 'POST', url: '/api/anomalies' } },
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get an anomaly',
						routing: { request: { method: 'GET', url: '=/api/anomalies/{{$parameter.anomalyId}}' } },
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many anomalies',
						routing: { request: { method: 'GET', url: '/api/anomalies' } },
					},
					{
						name: 'Update Status',
						value: 'updateStatus',
						action: 'Update an anomaly status',
						description: 'Résout, réinvestit ou classe une anomalie (Faux positif/Supprimé)',
						routing: {
							request: { method: 'PUT', url: '=/api/anomalies/{{$parameter.anomalyId}}/status' },
						},
					},
				],
				default: 'create',
			},

			// ── Anomaly > Create ───────────────────────────────────────────────
			{
				displayName: 'Standard Name or ID',
				name: 'standardId',
				type: 'options',
				description:
					'Norme à l\'origine de l\'anomalie. Choisissez dans la liste, ou spécifiez un ID via une expression.',
				typeOptions: { loadOptionsMethod: 'getStandards' },
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				required: true,
				routing: { send: { type: 'body', property: 'standardId' } },
			},
			{
				displayName: 'Standard Name',
				name: 'standardName',
				type: 'string',
				description: 'Nom de la norme tel qu\'il doit apparaître sur l\'anomalie',
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				required: true,
				routing: { send: { type: 'body', property: 'standardName' } },
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				required: true,
				routing: { send: { type: 'body', property: 'description' } },
			},
			{
				displayName: 'Detailed Message',
				name: 'detailedMessage',
				type: 'string',
				typeOptions: { rows: 4 },
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				routing: { send: { type: 'body', property: 'detailedMessage' } },
			},
			{
				displayName: 'Severity',
				name: 'severity',
				type: 'options',
				options: SEVERITY_OPTIONS,
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: 2,
				routing: { send: { type: 'body', property: 'severity' } },
			},
			{
				displayName: 'Source Type',
				name: 'sourceType',
				type: 'options',
				options: SOURCE_TYPE_OPTIONS,
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: 4,
				description: 'Défaut : Custom - approprié quand l\'anomalie provient de n8n plutôt que d\'un connecteur Kiality',
				routing: { send: { type: 'body', property: 'sourceType' } },
			},
			{
				displayName: 'Source Entity Type',
				name: 'sourceEntityType',
				type: 'string',
				description: 'Nom de la source à l\'origine de l\'anomalie (ex: nom du workflow n8n)',
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				routing: { send: { type: 'body', property: 'sourceEntityType' } },
			},
			{
				displayName: 'Source Entity ID',
				name: 'sourceEntityId',
				type: 'string',
				description: 'Identifiant unique de l\'entité en anomalie, pour la déduplication automatique',
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: '',
				routing: { send: { type: 'body', property: 'sourceEntityId' } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: { show: { resource: ['anomaly'], operation: ['create'] } },
				default: {},
				options: [
					{
						displayName: 'Assigned To (User) ID',
						name: 'assignedToId',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'assignedToId' } },
					},
					{
						displayName: 'Assigned To (User) Name',
						name: 'assignedToName',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'assignedToName' } },
					},
				],
			},

			// ── Anomaly > Get / Update Status ────────────────────────────────
			{
				displayName: 'Anomaly ID',
				name: 'anomalyId',
				type: 'string',
				displayOptions: { show: { resource: ['anomaly'], operation: ['get', 'updateStatus'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: STATUS_OPTIONS,
				displayOptions: { show: { resource: ['anomaly'], operation: ['updateStatus'] } },
				default: 'Resolved',
				routing: { send: { type: 'body', property: 'status' } },
			},
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				displayOptions: { show: { resource: ['anomaly'], operation: ['updateStatus'] } },
				default: '',
				routing: { send: { type: 'body', property: 'comment' } },
			},

			// ── Anomaly > Get Many : filtres ─────────────────────────────────
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				displayOptions: { show: { resource: ['anomaly'], operation: ['getAll'] } },
				default: {},
				options: [
					{
						displayName: 'Status Name or ID',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Detected', value: 'Detected' },
							{ name: 'Prevention', value: 'Prevention' },
							...STATUS_OPTIONS,
						],
						default: '',
						routing: { send: { type: 'query', property: 'status' } },
					},
					{
						displayName: 'Standard Name or ID',
						name: 'standardId',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getStandards' },
						default: '',
						routing: { send: { type: 'query', property: 'standardId' } },
					},
				],
			},

			// ── Standard : opérations (lecture seule) ────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['standard'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many standards',
						routing: { request: { method: 'GET', url: '/api/standards' } },
					},
				],
				default: 'getAll',
			},
		],
	};

	methods = {
		loadOptions: {
			async getStandards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'kialityApi', {
					method: 'GET',
					url: '/api/standards',
					json: true,
				})) as Array<{ id: string; name: string }>;

				return response.map((s) => ({ name: s.name, value: s.id }));
			},
		},
	};

	// Pas de méthode execute() : le routage déclaratif (routing) sur chaque opération ci-dessus
	// suffit à n8n pour construire et exécuter la requête HTTP correspondante.
}
