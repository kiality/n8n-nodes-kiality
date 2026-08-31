import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KialityApi implements ICredentialType {
	name = 'kialityApi';

	displayName = 'Kiality API';

	documentationUrl = 'https://docs.kiality.ai/integrations/n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.votre-organisation.kiality.ai',
			description: "URL de base de l'API Kiality de votre organisation (sans slash final)",
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Générée depuis Administration > Clés API dans Kiality',
		},
	];

	// L'en-tête X-Api-Key est ajouté automatiquement à chaque requête faite avec cette
	// credential - voir Kiality.Api/Authentication/ApiKeyAuthenticationHandler.cs côté serveur.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	// GET /api/anomalies/mine est accessible à n'importe quel rôle (contrairement à la
	// plupart des autres endpoints, réservés Administrator/Manager) - c'est le seul test
	// de connexion valable quel que soit le rôle choisi pour la clé.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/anomalies/mine',
		},
	};
}
