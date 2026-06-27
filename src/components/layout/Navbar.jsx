import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';

import { IMAGES } from '../../data/catalog';

import { NAV_LINKS, BUSINESS_INFO } from '../../data/constants';
import { scrollToSection } from '../../hooks/useScrollTo';
import { useCart } from '../../context/CartContext';

import '../ui/components.css';


/**
 * Navbar fija con glassmorphism y navegación suave.
 */
const Navbar = ({ onCartOpen }) => {

  const { itemCount } = useCart();

  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);



  useEffect(() => {

    const handleScroll = () => {

      setScrolled(window.scrollY > 50);

    };


    window.addEventListener('scroll', handleScroll);


    return () => {

      window.removeEventListener('scroll', handleScroll);

    };


  }, []);




  const handleNavClick = (href) => {

    scrollToSection(href);

    setMobileOpen(false);

  };





  return (

    <>


      <nav 
        className={`navbar-masia ${scrolled ? 'scrolled' : ''}`}
      >


        <div className="navbar-container">



          {/* LOGO + MARCA */}

          <button

            type="button"

            className="navbar-brand"

            onClick={() => handleNavClick('#inicio')}

            aria-label="Ir al inicio"

          >


            <img
              src={IMAGES.logo}
              alt="La Masia Pizzería"
              className="navbar-logo"
            />



            <div className="brand-text">


              <h1>
                LA MASIA
              </h1>


              <span>
                {BUSINESS_INFO.slogan}
              </span>


            </div>



          </button>





          {/* LINKS */}

          <div className="navbar-links">


            {NAV_LINKS.map((link) => (


              <button

                key={link.id}

                type="button"

                className="navbar-link"

                onClick={() => handleNavClick(link.href)}

              >

                {link.label}


              </button>


            ))}


          </div>





          {/* ACCIONES */}

          <div className="navbar-actions">



            <button

              type="button"

              className="cart-btn"

              onClick={onCartOpen}

              aria-label="Abrir carrito"

            >


              <FaShoppingCart />


              {itemCount > 0 && (

                <span className="cart-badge">

                  {itemCount}

                </span>

              )}


            </button>





            <button

              type="button"

              className="menu-toggle"

              onClick={() => setMobileOpen(!mobileOpen)}

              aria-label="Menú"

            >


              {mobileOpen ? <FaTimes /> : <FaBars />}



            </button>


          </div>




        </div>


      </nav>






      {/* MENU MOBILE */}


      <AnimatePresence>


        {mobileOpen && (



          <motion.div

            className="mobile-menu"

            initial={{
              opacity:0,
              x:'100%'
            }}

            animate={{
              opacity:1,
              x:0
            }}

            exit={{
              opacity:0,
              x:'100%'
            }}

            transition={{
              duration:0.3
            }}

          >



            {NAV_LINKS.map((link)=>(


              <button


                key={link.id}


                type="button"


                className="mobile-menu-link"


                onClick={() => handleNavClick(link.href)}


              >

                {link.label}


              </button>


            ))}



          </motion.div>


        )}



      </AnimatePresence>



    </>


  );

};


export default Navbar;