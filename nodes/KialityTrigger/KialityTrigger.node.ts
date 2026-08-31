import type {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

// Récepteur passif : Kiality pousse les événements (webhooks sortants existants -
// Kiality.Infrastructure/Services/WebhookDispatchService.cs), aucune credential ni appel
// sortant n'est nécessaire côté n8n pour ce node.
export class KialityTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kiality Trigger',
		name: 'kialityTrigger',
		icon: 'file:kialityTrigger.svg',
		group: ['trigger'],
		version: 1,
		description: "Se déclenche quand Kiality crée, résout ou change le statut d'une anomalie",
		defaults: { name: 'Kiality Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'kiality',
			},
		],
		properties: [
			{
				displayName:
					"Copiez l'URL de webhook ci-dessus, puis ajoutez-la comme connecteur sortant dans Kiality " +
					"(Normes > Escalade, ou Paramètres > Webhooks sortants), en la limitant aux normes et " +
					"événements souhaités (Créée / Résolue / Changement de statut).",
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
