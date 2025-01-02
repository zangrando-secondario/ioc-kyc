"use client";
import React, { useEffect, useState } from 'react';
import {client} from '../../hooks/lib/thirdwebClient';
import { ref, onValue } from 'firebase/database';
import { database } from '../../hooks/lib/firebase';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { ConnectButton, useActiveAccount} from 'thirdweb/react';

interface Person {
  name: string;
  surname: string;
  email: string;
}

interface NFTData {
  firstName: string;
  lastName: string;
  tokenId: string;
  status: string;
  email: string;
}

const people: Person[] = [
  { name: 'Rina', surname: 'Middonti', email: 'rinamiddonti.p@gmail.com' },
  { name: 'Elisabetta', surname: 'Bernasconi', email: 'elibernasconi66@gmail.com' },
  { name: 'Liliana', surname: 'Chicu', email: 'lilichicu@gmail.com' },
  { name: 'Lucia', surname: 'de Maglie', email: 'luciademaglie025@gmail.com' },
  { name: 'ROBERTO', surname: 'GLEREANI', email: 'roberto.glereani@gmail.com' },
  { name: 'Lucia', surname: 'Corna', email: 'luciacorna53@gmail.com' },
  { name: 'Barbara', surname: 'Petrarchi', email: 'mirtilla70@proton.me' },
  { name: 'Patrizia', surname: 'Pizzaga', email: 'maremosso2024@gmail.com' },
  { name: 'Marina', surname: 'Nocera', email: 'marinanocerage@gmail.com' },
  { name: 'Abba maria', surname: 'Marrone', email: 'annamariacrisafulli@libero.it' },
  { name: 'Alberto', surname: 'Pedrazzo', email: 'a.pedrazzo@gmail.com' },
  { name: 'Beatrice', surname: 'Pintilie', email: 'beatrice.p2024@virgilio.it' },
  { name: 'Antonino', surname: 'Di Natale', email: 'dinatalemarzia62@gmail.com' },
  { name: 'Raffaella', surname: 'Bernasconi', email: 'bernasconiraffaella@gmail.com' },
  { name: 'Lucien', surname: 'HANANIA', email: 'cherabg@pm.me' },
  { name: 'Lina', surname: 'Raffaelli', email: 'casalina01@gmail.com' },
  { name: 'Mazzon', surname: 'Michele', email: 'mikymazzon@libero.it' },
  { name: 'Serena', surname: 'Berrettini', email: 'serenber5@gmail.com' },
  { name: 'Adriano', surname: "D'Andrea", email: 'calvani.cristina@gmail.com' },
  { name: 'Nadia', surname: 'Antoniani', email: 'nadia.antoniani@yahoo.it' },
  { name: 'Rossella', surname: 'Vitone', email: 'rossellavitone@gmail.com' },
  { name: 'Pietro Pron', surname: 'Maffiotti', email: 'p.pronmaffiotti@gmail.com' },
  { name: 'Maria Rosa', surname: 'Boatta', email: 'mboatta17@gmail.com' },
  { name: 'Emanuele', surname: 'Loi', email: 'GIANL@TISCALI.IT' },
  { name: 'Liliana', surname: 'Picano', email: 'lilianapicano@libero.it' },
  { name: 'Daniele', surname: 'Conte', email: 'contedanielelyo@gmail.com' },
  { name: 'Angelino', surname: 'Cillara', email: 'angelinocillara@gmail.com' },
  { name: 'Leone', surname: 'Mangeruca', email: 'l.mangeruca@hotmail.it' },
  { name: 'Daniele', surname: 'Merlin', email: 'merlindaniele40@gmail.com' },
  { name: 'Franca', surname: 'Camodeca', email: 'frensis2014@gmail.com' },
  { name: 'Patrizia', surname: 'Ansaldo', email: 'patansit@yahoo.es' },
  { name: 'Teresa', surname: 'Timeo', email: 'terrytimeo@gmail.com' },
  { name: 'Antonio', surname: 'Concina', email: 'coincide3@gmail.com' },
];

const Dashboard: React.FC = () => {
  const [nftData, setNftData] = useState<Record<string, NFTData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const address = useActiveAccount();

  useEffect(() => {
    // Carica i dati NFT da Firebase
    const nftRef = ref(database, 'mint-requests');
    const unsubscribe = onValue(nftRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase data:', data);
      setNftData(data || {});
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatus = (person: Person) => {
    const nft = Object.values(nftData).find(
      (nft) =>
        nft.firstName.toLowerCase() === person.name.toLowerCase() &&
        nft.lastName.toLowerCase() === person.surname.toLowerCase() &&
        nft.email.toLowerCase() === person.email.toLowerCase()
    );

    if (nft) {
      return <span className="text-green-500">Nft claimed (Token ID: {nft.tokenId})</span>;
    }

    // Simulate checking payment status from Stripe
    const paidEmails = [
      'maremosso2024@gmail.com',
      'marinanocerage@gmail.com',
      'dinatalemarzia62@gmail.com',
      'bernasconiraffaella@gmail.com',
      'casalina01@gmail.com',
      'mikymazzon@libero.it',
      'rossellavitone@gmail.com',
      'frensis2014@gmail.com',
    ];

    if (paidEmails.includes(person.email.toLowerCase())) {
      return <span className="text-yellow-500">Paid (No kyc)</span>;
    }

    const kycFinishedEmails = [
      'annamariacrisafulli@libero.it',
      'a.pedrazzo@gmail.com',
      'beatrice.p2024@virgilio.it',
      'calvani.cristina@gmail.com',
      'nadia.antoniani@yahoo.it',
      'mboatta17@gmail.com',
      'l.mangeruca@hotmail.it',
      'merlindaniele40@gmail.com',
      'patansit@yahoo.es',
      'terrytimeo@gmail.com',
    ];

    if (kycFinishedEmails.includes(person.email.toLowerCase())) {
      return <span className="text-yellow-500">Kyc finished NOT Nft</span>;
    }

    return <span className="text-red-500">Nft not claimed</span>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (address?.address !== '0x2FBF5571E6e01db1A5b17E4011f7Af47d4777Ab9') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConnectButton 
            client={client}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      
      <div className="rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">People List ({people.length})</h2>
        </div>
        <ScrollArea.Root className="w-full overflow-hidden">
          <ScrollArea.Viewport className="w-full">
            <div className="p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">
                      Surname
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.email} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                      <td className="p-4">{person.name}</td>
                      <td className="p-4">{person.surname}</td>
                      <td className="p-4">{person.email}</td>
                      <td className="p-4">{getStatus(person)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      </div>
    </div>
  );
};

export default Dashboard;