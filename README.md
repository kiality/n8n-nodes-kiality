# n8n-nodes-kiality

Nodes n8n pour [Kiality](https://kiality.ai) : créez, mettez à jour et déclenchez des workflows
sur les anomalies de conformité détectées par Kiality, directement depuis n8n.

## Contenu du paquet

- **Credential `Kiality API`** — URL de base + clé API.
- **Node `Kiality`** (action) — ressources *Anomaly* (Create / Get / Get Many / Update Status)
  et *Standard* (Get Many).
- **Node `Kiality Trigger`** — reçoit les événements poussés par les webhooks sortants Kiality
  (anomalie créée, résolue, changement de statut) ; ne nécessite aucune credential.

## Prérequis côté Kiality

1. Dans Kiality, aller dans **Administration > Clés API** et créer une clé (choisir le rôle avec
   lequel l'intégration doit agir - `Manager` couvre la plupart des cas d'usage n8n).
2. Copier la clé affichée (elle n'est montrée qu'une seule fois).

## Installation (auto-hébergé)

Dans votre instance n8n : **Settings > Community Nodes > Install**, puis entrer
`n8n-nodes-kiality`.

## Développement local

```bash
npm install
npm run build   # compile TypeScript + copie les icônes SVG dans dist/
npm run dev      # recompile en continu
```

Pour tester dans une vraie instance n8n locale, mounter ce dossier dans
`~/.n8n/custom/node_modules/n8n-nodes-kiality` (voir le guide officiel
[Run your node locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/)
pour les alternatives).

### Validé en conditions réelles

Testé dans une instance n8n locale (Docker, `docker.n8n.io/n8nio/n8n:latest`) avec le paquet monté
en tant que node communautaire non publié (`N8N_UNVERIFIED_PACKAGES_ENABLED=true`) :

- les deux nodes (`Kiality`, `Kiality Trigger`) et la credential `Kiality API` se chargent sans
  erreur et sont regroupés sous une seule app "Kiality" avec les 5 opérations attendues
  (Create/Get/Get Many/Update Status pour Anomaly, Get Many pour Standard) ;
- le formulaire "Create an anomaly" affiche tous les champs, avec les valeurs par défaut
  correctes (Severity=Medium, Source Type=Custom) ;
- le champ dynamique "Standard Name or ID" affiche bien *"Set up credential to see options"*
  tant qu'aucune credential n'est configurée (le câblage `loadOptions` est correct) ;
- `Kiality Trigger` génère une URL de webhook valide (`POST .../webhook-test/<id>/kiality`) ;
- l'icône de la marque s'affiche correctement sur les deux nodes.

**Reste à valider** (nécessite un vrai Kiality déployé + une vraie clé API) : que les appels HTTP
réels vers `/api/anomalies` et `/api/standards` répondent comme attendu, et le comportement du
trigger avec un vrai webhook sortant Kiality configuré.

## Publication

Deux chemins, selon le besoin :

**Itération locale / rafraîchir uniquement le `.tgz` servi par le Hub** — voir
[`k8s-ps1/12-Publish-N8nPackage.ps1`](../../k8s-ps1/12-Publish-N8nPackage.ps1) dans le
monorepo Kiality (`-SkipPublish` pour ne pas toucher au registre npm public).

**Publication officielle (registre npm public + éligibilité au programme Verified)** — via
[`.github/workflows/publish.yml`](.github/workflows/publish.yml), déclenché par un tag `v*` :

```bash
npm version 0.2.0   # met à jour package.json + crée le tag git
git push --follow-tags
```

Le secret de dépôt `NPM_TOKEN` (token npm de type *Automation*, droits de publication sur
`n8n-nodes-kiality`) doit être configuré dans *Settings > Secrets and variables > Actions* du
dépôt GitHub avant le premier déclenchement.

Pour la visibilité dans le panneau de nodes de n8n Cloud (pas seulement l'auto-hébergé), soumettre
ensuite au [programme Verified Community Nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/) :
TypeScript strict (✓), aucune dépendance runtime (✓), chaînes de l'interface en anglais (✓),
README, lint propre (✓), publication via GitHub Actions avec attestation de provenance (✓ —
`npm publish --provenance` dans le workflow ci-dessus, obligatoire depuis le 1er mai 2026 pour
les soumissions via le Creator Portal).

## Licence

MIT
