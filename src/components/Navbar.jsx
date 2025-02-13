import { Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
} from "@material-tailwind/react";

export function NavbarDefault() {
  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-3">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5"
        >
          Cafe Booking
        </Typography>
        <div className="flex items-center gap-4">
          <Link to="/cafes">
            <Button variant="gradient" size="sm">
              Book a Table
            </Button>
          </Link>
        </div>
      </div>
    </Navbar>
  );
}

export default NavbarDefault; 