'use client'

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const testFirestore = async () => {
      const snapshot = await getDocs(collection(db, 'users')); // assuming 'users' collection
      console.log("Fetched users:", snapshot.docs.map(doc => doc.data()));
    };
    testFirestore();
  }, []);

  return <div className="p-4 text-green-700">Firebase Connected ✅</div>;
}
