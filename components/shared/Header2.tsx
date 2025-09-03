'use client';
import { usePathname, useRouter } from 'next/navigation';

export const Header2 = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Home', href: '/battlefield' },
    { label: 'Matches', href: '/battlefield/matches' },
    { label: 'Standings', href: '' },
    { label: 'Stats', href: '' },
    { label: 'Teams', href: '/battlefield/teams' },
    { label: 'News', href: '' },
    { label: 'Rules', href: '' },
  ];

  return (
    <div className="relative bg-[#0c2031] pl-[158px] flex items-center z-20">
      <div className="flex items-center space-x-4 border-[2px] mt-[8px] mb-[8px] border-[#377cca] p-2 rounded-md bg-gradient-to-r from-[#12436c] to-transparent">
        <img
          src="/bfVImg.jpg"
          alt="Example"
          className="w-[34px] object-cover h-8 rounded-md"
        />
        <select className="bg-transparent text-white w-[150px] text-[14px]">
          <option>Battlefield</option>
        </select>
      </div>

      <div className="flex space-x-4 ml-[59px] text-white text-[14px] h-[60px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <div
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`cursor-pointer flex items-center h-full px-2 ${
                isActive ? 'border-b-2 border-white font-bold' : ''
              } hover:border-b-2 hover:border-white transition`}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
