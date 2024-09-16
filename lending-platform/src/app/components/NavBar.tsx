"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  // Function to check if the current route is active
  const isActive = (path: any) => path === pathname;

  const MENU_LIST = [
    { title: "Home", href: "/" },
    { title: "Create Loan", href: "/create-loan" },
    { title: "Fund Loan", href: "/fund-loan" },
    { title: "Repay Loan", href: "/repay-loan" },
    { title: "Cancel Loan", href: "/cancel-loan" },
    { title: "Claim Collateral", href: "/claim-collateral" },
  ];

  return (
    <nav className="bg-gray-800 px-10 py-5">
      <div className="container mx-auto flex justify-between">
        {/* Logo or Brand Name */}
        <div className="text-white text-2xl font-bold">
          Lending & Borrowing Platform
        </div>

        {/* Menu Links TODO: Divide logic into several pages */}
        {/* {MENU_LIST.map((menu: any) => (
          <div className="flex space-x-4" key={menu.title}>
            <Link
              href={menu.href}
              className={`link ${
                pathname === menu.href
              } ? "active bg-gray-900" : "hover:bg-gray-700"
            } text-white px-3 py-2 rounded-md text-sm font-medium`}
            >
              {menu.title}
            </Link>
          </div>
        ))} */}
        <w3m-button />
      </div>
    </nav>
  );
};

export default Navbar;
