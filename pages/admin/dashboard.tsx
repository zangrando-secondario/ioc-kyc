"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { database } from '../../hooks/lib/firebase';
import { client } from '../../hooks/lib/thirdwebClient';

interface Person {
  name: string;
  surname: string;
  email: string;
}

interface NFTData {
  contractAddress: string;
  contractType: string;
  destinationAddress: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  quantity: number;
  status: string;
  timestamp: string;
  tokenId: string;
}

export default function Dashboard() {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const address = useActiveAccount();

  useEffect(() => {
    const nftRef = ref(database, 'mint-requests');
    return onValue(nftRef, (snapshot) => {
      const data = snapshot.val() || {};
      const nftEntries = Object.values(data) as NFTData[];
      setNftData(nftEntries);
      
      const allPeople = new Map<string, Person>();
      
      staticPeople.forEach(person => 
        allPeople.set(person.email.toLowerCase(), person)
      );
      
      nftEntries.forEach(nft => {
        if (!allPeople.has(nft.email.toLowerCase())) {
          allPeople.set(nft.email.toLowerCase(), {
            name: nft.firstName.trim(),
            surname: nft.lastName.trim(),
            email: nft.email.trim()
          });
        }
      });
      
      setPeople(Array.from(allPeople.values()));
      setLoading(false);
    });
  }, []);

  const getStatus = (person: Person) => {
    const nft = nftData.find(nftRecord => {
      const emailMatch = person.email.toLowerCase() === nftRecord.email.toLowerCase();
      if (emailMatch) return true;

      const nameMatch = person.name.toLowerCase().trim() === nftRecord.firstName.toLowerCase().trim() &&
                       person.surname.toLowerCase().trim() === nftRecord.lastName.toLowerCase().trim().replace(/\s+/g, '');
      
      const specialCases: { [key: string]: string } = {
        'gianl@tiscali.it': nftRecord.tokenId === '9' ? nftRecord.tokenId : '',
        'coincide3@gmail.com': nftRecord.email === 'antonio.concina@gmail.com' ? nftRecord.tokenId : '',
        'p.pronmaffiotti@gmail.com': person.name === 'Pietro Pron' && nftRecord.firstName.toLowerCase().includes('pietro') ? nftRecord.tokenId : ''
      };

      if (specialCases.hasOwnProperty(person.email.toLowerCase())) {
        return specialCases[person.email.toLowerCase()] === nftRecord.tokenId;
      }

      return nameMatch;
    });

    if (nft) return <span className="text-green-500">Nft claimed (Token ID: {nft.tokenId})</span>;

    const statusMap = {
      paid: [
        'maremosso2024@gmail.com', 'marinanocerage@gmail.com', 'dinatalemarzia62@gmail.com',
        'bernasconiraffaella@gmail.com', 'casalina01@gmail.com', 'mikymazzon@libero.it',
        'rossellavitone@gmail.com', 'frensis2014@gmail.com'
      ],
      kyc: [
        'annamariacrisafulli@libero.it', 'a.pedrazzo@gmail.com', 'beatrice.p2024@virgilio.it',
        'calvani.cristina@gmail.com', 'nadia.antoniani@yahoo.it', 'mboatta17@gmail.com',
        'l.mangeruca@hotmail.it', 'merlindaniele40@gmail.com', 'patansit@yahoo.es',
        'terrytimeo@gmail.com'
      ]
    };

    const email = person.email.toLowerCase();
    if (statusMap.paid.includes(email)) return <span className="text-yellow-500">Paid (No kyc)</span>;
    if (statusMap.kyc.includes(email)) return <span className="text-yellow-500">Kyc finished NOT Nft</span>;
    return <span className="text-red-500">Nft not claimed</span>;
  };

  if (loading) return <div>Loading...</div>;

  const isAuthorized = [
    '0x2FBF5571E6e01db1A5b17E4011f7Af47d4777Ab9',
    '0xd48b3007354fB5BdBEaC3c2aa435983b1cEF73D2'
  ].includes(address?.address || '');

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConnectButton client={client} />
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
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">Surname</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map(person => (
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
}

const staticPeople: Person[] = [
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
  { name: 'Antonio', surname: 'Concina', email: 'coincide3@gmail.com' }
];