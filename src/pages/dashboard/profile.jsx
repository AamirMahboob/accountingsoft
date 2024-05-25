// Profile.jsx
import React, { useState } from 'react';
import { Button } from '@material-tailwind/react';
import IncomeCard from '@/widgets/cards/IncomeCard';
import ExpenseCard from '@/widgets/cards/ExpenseCard';

export function Profile() {
  const [tab, setTab] = useState(false);

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <Button onClick={() => setTab(false)} color={tab ? "gray" : "blue"}>Expenses</Button>
        <Button onClick={() => setTab(true)} color={!tab ? "gray" : "blue"}>Income</Button>
      </div>
      <div>
        {tab ? <IncomeCard /> : <ExpenseCard />}
      </div>
    </div>
  );
}

export default Profile;

