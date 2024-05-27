import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option,Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed
import { MdDeleteOutline } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";


const IncomeCard = () => {
  const [incomes, setIncomes] = useState([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchIncomes = async () => {
      setLoader(true);
      const incomeCollection = collection(db, 'incomes');
      const incomeSnapshot = await getDocs(incomeCollection);
      const incomeList = incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncomes(incomeList);
      setLoader(false);
    };

    fetchIncomes();
  }, []);

  const handleAddEditIncome = async () => {
    setLoader(true);
    if (!description || !date || !amount) {
      setError('All fields must be filled out');
      setLoader(false);
      return;
    }

    const newIncome = { description, date, amount };
    setError('');

    if (editIndex !== null) {
      const incomeDoc = doc(db, 'incomes', incomes[editIndex].id);
      await updateDoc(incomeDoc, newIncome);
      const updatedIncomes = incomes.map((income, index) =>
        index === editIndex ? { ...income, ...newIncome } : income
      );
      setIncomes(updatedIncomes);
      setEditIndex(null);
    } else {
      const docRef = await addDoc(collection(db, 'incomes'), newIncome);
      setIncomes([...incomes, { ...newIncome, id: docRef.id }]);
    }

    setLoader(false);
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

  const handleDelete = async (index) => {
    setLoader(true);
    const incomeDoc = doc(db, 'incomes', incomes[index].id);
    await deleteDoc(incomeDoc);
    const updatedIncomes = incomes.filter((_, i) => i !== index);
    setIncomes(updatedIncomes);
    setLoader(false);
  };

  const handleFilterChange = (e) => {
    setFilterMonth(e);
  };

  const filteredIncomes = incomes.filter((income) => {
    if (!filterMonth) return true;
    const incomeDate = new Date(income.date);
    return incomeDate.getMonth() + 1 === parseInt(filterMonth);
  });

  return (
    <Card className='flex flex-col gap-4 bg-[#F6F7F8] '>
      <CardBody className='border border-black rounded-md bg-white'>
        <Typography variant="h5">Income</Typography>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <Typography variant="h6">Description</Typography>
            <Input
              type="text"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Date</Typography>
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Amount</Typography>
            <Input
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button className="w-32 h-10 mt-6" onClick={handleAddEditIncome}>
            {editIndex !== null ? 'Edit Income' : 'Add Income'}
          </Button>
        </div>
        {error && <Typography color="red">{error}</Typography>}
        <div className="mb-4">
          <Select label="Filter by Month" value={filterMonth} onChange={(e) => handleFilterChange(e)}>
            <Option value="">All</Option>
            {[...Array(12).keys()].map((month) => (
              <Option key={month + 1} value={month + 1}>
                {new Date(0, month).toLocaleString('en-US', { month: 'long' })}
              </Option>
            ))}
          </Select>
        </div>
      </CardBody>
      <CardBody className='border border-black rounded-md bg-white' >
      <Typography variant="h6" >Income Table</Typography>

      {loader ? (
        <div className="flex justify-center items-center py-4">
          <Typography variant="h6"><Spinner /></Typography>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((income, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{income.description}</td>
                  <td className="px-6 py-4">{income.date}</td>
                  <td className="px-6 py-4">{income.amount}</td>
                  <td className="px-6 py-4">
                    <Button className='mr-5' size="sm" onClick={() => handleEdit(index)}><MdModeEdit size={20}/></Button>
                    <Button className='bg-red-500' size="sm" onClick={() => handleDelete(index)}><MdDeleteOutline size={20} /></Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      </CardBody>
    </Card>
  );
};

export default IncomeCard;
