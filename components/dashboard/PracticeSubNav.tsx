'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link'; // Import the Link component

// Helper function to create URL-friendly slugs
const slugify = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, '-');
};

const practiceNavLinks = [
  {
    label: 'Prelims (Year)',
    type: 'prelims',
    filter: 'year',
    gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)',
    dropdownItems: ['2025', '2024', '2023', '2022', '2021'],
  },
  {
    label: 'Prelims (Sub)',
    type: 'prelims',
    filter: 'subject',
    gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)',
    dropdownItems: ['Polity', 'Geo (Ind)', 'Economics', 'A. History', 'Env. & Eco.'],
  },
  {
    label: 'Mains (Year)',
    type: 'mains',
    filter: 'year',
    gradient: 'linear-gradient(135deg, #FFD1B5, #E1E5F8)',
    dropdownItems: ['2025', '2024', '2023', '2022', '2021'],
  },
  {
    label: 'Mains (Sub)',
    type: 'mains',
    filter: 'subject',
    gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)',
    dropdownItems: ['GS Paper 1', 'GS Paper 2', 'GS Paper 3', 'GS Paper 4', 'Essay'],
  },
  {
    label: 'CSAT',
    type: 'csat',
    filter: 'year',
    gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)',
    dropdownItems: ['2025', '2024', '2023', '2022', '2021'],
  },
];

const PracticeSubNav = () => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-12">
          <div className="flex items-center space-x-6">
            {practiceNavLinks.map((link) => (
              <Menu as="div" key={link.label} className="relative text-left">
                <Menu.Button
                  className="group inline-flex justify-center items-center w-full rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none transition-all duration-300"
                  style={{
                    background: hoveredLabel === link.label ? link.gradient : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredLabel(link.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                >
                  <span>{link.label}</span>
                  <ChevronDown
                    className="ml-2 -mr-1 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {link.dropdownItems.map((item) => (
                        <Menu.Item key={item}>
                          {({ active }) => (
                            // --- THIS IS THE FIX ---
                            // The <a> tag has been removed, and its classes are now on the <Link> component
                            <Link
                              href={`/practice/${link.type}/${link.filter}/${slugify(item)}`}
                              className={`${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } block px-4 py-2 text-sm`}
                            >
                              {item}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PracticeSubNav;