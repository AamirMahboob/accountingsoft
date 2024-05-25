// IncomeCard.jsx
import React, { useState } from 'react';
import { Card, CardBody, Typography, Button, Input } from '@material-tailwind/react';

const IncomeCard = () => {
  const [incomes, setIncomes] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const handleAddEditIncome = () => {
    const newIncome = { description, date, amount };

    if (editIndex !== null) {
      const updatedIncomes = incomes.map((income, index) =>
        index === editIndex ? newIncome : income
      );
      setIncomes(updatedIncomes);
      setEditIndex(null);
    } else {
      setIncomes([...incomes, newIncome]);
    }

    setDescription('');
    setDate('');
    setAmount('');
  };

  const handleEdit = (index) => {
    const income = incomes[index];
    setDescription(income.description);
    setDate(income.date);
    setAmount(income.amount);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedIncomes = incomes.filter((_, i) => i !== index);
    setIncomes(updatedIncomes);
  };

  return (
    <Card>
      <CardBody>
        <Typography variant="h5">Income</Typography>
        <div className="flex space-x-4">
          <Input
            type="text"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button onClick={handleAddEditIncome} className="mt-4">
          {editIndex !== null ? 'Edit Income' : 'Add Income'}
        </Button>
        <ul>
          {incomes.map((income, index) => (
            <li key={index} className="flex justify-between">
              <span>{income.description}</span>
              <span>{income.date}</span>
              <span>{income.amount}</span>
              <Button onClick={() => handleEdit(index)}>Edit</Button>
              <Button onClick={() => handleDelete(index)}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default IncomeCard;
