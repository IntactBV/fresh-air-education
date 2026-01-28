import Image from 'next/image'

export const MasterHeader = () => {
  return (
    <header className="master-header">
      <div className="flex justify-between items-center align-middle">
        <div className='flex justify-start'>
          <Image src="/assets/images/ue-flag.jpeg" alt="Logo" width={92} height={50} />
          <h3 className="text-3xl font-bold ml-6 mt-2">Cofinanțat de<br /> Uniunea Europeană</h3>
        </div>
        <div className='flex justify-end'>
          <h3 className="mr-6 mt-2 text-right"><strong>FRESH TECH - Tehnologii și educație pentru studenți</strong><br />Cod SMIS: <b>317582</b><br />Denumirea beneficiarului: <b>Fresh Air SRL</b></h3>
          <Image src="/assets/images/guvern-ro.jpeg" alt="Logo" width={60} height={50} />
        </div>
      </div>
    </header>
  );
};