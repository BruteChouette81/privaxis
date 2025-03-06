
function Legal (props) {
    return (
        window.localStorage.getItem("language") == "en" ? 
        <div className="legal" style={{"marginTop": "7%" , "marginLeft":"15%", "marginRight": "15%", "fontSize": "20pt"}}>
<h1>Service contract</h1>
<br />
<h4>{props.name} (the “Company”) </h4>
<h4>last modification: February 17th 2025</h4>
<p>The parties agree that the original version of this contract is in French. This English version is provided for convenience, and in case of any discrepancies, the French version shall prevail.</p>
<br />
<h2>1. Purpose</h2>
<p>The Company provides services to businesses (B2B) to enhance the security and management of their clients' data while decentralizing and encrypting sensitive information.</p>
<br />
<h2>2. Client Data</h2>
<p>
The Company will access and store the Client’s full name, email address, and API key required to connect with the Client’s commercial partners.
<br />
<br />
The Company ensures that all data will be encrypted and stored securely.
<br />
<br />
The Company shall not access or store the data of the Client’s customers. The platform is designed to decentralize and secure these data, providing, in the Company’s estimation, near-impenetrable security.
</p>
<br />
<h2>3. Fees</h2>
<p>
<strong>The Client agrees to pay a fixed subscription fee based on the selected service level:</strong>
<br />

Level 1: $15 per month
<br />

Level 2: $100 per month
<br />
Level 3: Custom pricing based on the Client’s needs
<br />
<br />

Payments are due on a monthly basis and will be automatically charged in canadian dollars (CAD) unless otherwise agreed in writing.
</p>
<br />
<h2>4. Confidentiality</h2>
<p>
The Company agrees to maintain the confidentiality of all Client information and not to disclose it to third parties unless required by law or authorized in writing by the Client.
</p>
<br />
<h2>5. Liability</h2>
<p>The Company shall not be held liable for any indirect, incidental, or consequential damages arising from the use of its services, except in cases of gross negligence or willful misconduct.</p>
<br />
<h2>6. Termination</h2>
<p>Either party may terminate this agreement with a 30-day written notice. In the event of termination, the Company will ensure the secure deletion of all Client data within 30 days.</p>
<br />
<h2>7. Governing Law</h2>
<p>This agreement is governed by the laws of the Province of Quebec, Canada. Any disputes shall be resolved in the courts of Quebec.</p>
        </div>
        
        : <div className="legal" style={{"marginTop": "7%" , "marginLeft":"15%", "marginRight": "15%", "fontSize": "20pt"}}>
<h1>Contrat de Services</h1>
<br />
<h4>Date de la derniere modification: 17 février 2025</h4>
<br />
<h2>Article 1 : Objet du Contrat</h2>
<p>Ce contrat définit les termes et conditions selon lesquels {props.name} (ci-après « l’Entreprise ») fournit ses services au client (ci-après « le Client »). L’Entreprise offre des solutions de gestion et de sécurité des données dans un cadre B2B, garantissant la décentralisation et la sécurité avancée des données des clients finaux.</p>
<br />
<h2>Article 2 : Collecte et Traitement des Données</h2>
<p>
<strong>Données collectées par l’Entreprise :</strong>
<br />
Nom complet
<br />
Adresse e-mail
<br />

API Key permettant la connexion aux partenaires commerciaux respectifs du Client.
<br />

<strong>Traitement des données : </strong>
<br />

Les données collectées seront chiffrées en tout temps, tant en transit qu’au repos.
<br />

L’Entreprise n’aura jamais accès aux données des clients finaux du Client, mais garantit leur sécurité grâce à des technologies décentralisées et des mécanismes de protection avancés.
<br />

<strong>Responsabilités de l’Entreprise : </strong>
<br />

Assurer la sécurité des données collectées et stockées.
<br />

Signaler toute violation de données dans un délai de 72 heures conformément à la loi 25 du Québec.
<br />

<strong>Responsabilités du Client :</strong>
<br />

Fournir des informations exactes et complètes.
<br />

Respecter les lois en vigueur relatives à la protection des données.
</p>
<br />
<h2>Article 3 : Offre de Services et Tarification</h2>
<p>
<strong>Forfaits d’abonnement :</strong>
<br />

Niveau 1 – 15$/mois : Accès de base aux services de gestion et de sécurité des données.
<br />

Niveau 2 – 100$/mois : Accès avancé avec outils d’analyse supplémentaires et support prioritaire.
<br />

Niveau 3 – Tarification sur mesure : Solutions personnalisées adaptées aux besoins spécifiques du Client.
<br />

<strong>Modalités de paiement :</strong>
<br />

Les abonnements sont facturés mensuellement, en dollars canadiens (CAD).
<br />

Le paiement est exigé avant le début de chaque cycle mensuel.
<br />

Tout retard de paiement peut entraîner une suspension des services.

</p>
<br />
<h2>Article 4 : Confidentialité</h2>
<p>
L’Entreprise s’engage à respecter la confidentialité des données personnelles du Client et des données des clients finaux.
<br />

L’Entreprise déclare avoir mis en place des méthodes de sécurité avancé pour protéger les données traitées.
<br />

Les données personnelles ne seront jamais partagées ou vendues à des tiers, sauf obligation légale.
</p>
<br />
<h2>Article 5 : Durée et Résiliation</h2>
<p>Durée du contrat : Ce contrat est conclu pour une durée indéterminée.
<br />

Résiliation : Chaque partie peut résilier le contrat avec un préavis écrit de 30 jours. En cas de non-respect des termes, l’autre partie peut résilier immédiatement.</p>
<br />
<h2>Article 6 : Limitation de Responsabilité</h2>
<p>L’Entreprise ne pourra être tenue responsable des pertes ou dommages indirects subis par le Client, sauf en cas de négligence grave ou de faute intentionnelle.</p>
<br />
<h2>Article 7 : Lois Applicables</h2>
<p>Ce contrat est régi par les lois en vigueur dans la province de Québec. Tout litige sera soumis à la juridiction exclusive des tribunaux québécois.</p>
        </div>
    )
}

export default Legal;
