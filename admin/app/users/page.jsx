"use client";

import React from 'react';
import AllUserAnalytics from "../Components/User/AllUserAnalytics";
import { useSearchParams } from 'next/navigation';
import CreateUser from '../Components/User/CreateUser';
import AllUsers from '../Components/User/AllUsers';
import ManageAdmin from '../Components/User/ManageAdmin';

export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === 'analytics' && <AllUserAnalytics />}
          {tab === 'create' && <CreateUser />}
          {tab === 'allusers' && <AllUsers />}
          {tab === 'manageadmin' && <ManageAdmin />}
        </main>
      </div>
    </>
  );
}
