import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  Box,
  Drawer,
  IconButton,
  Dialog,
  DialogTitle,
} from "@mui/material";
import MyNavbar from "./MyNavbar";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import { LuLeafyGreen } from "react-icons/lu";
import { CiDeliveryTruck } from "react-icons/ci";
import CloseIcon from "@mui/icons-material/Close";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/actions";
import Footer from "./Footer";

const ADD_TO_CART_URL = "http://localhost:3001/customers/add/";
const REMOVE_FROM_CART_URL = "http://localhost:3001/customers/remove/";

const ProductDetailsCustomer = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartProducts, setCartProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const cartItems = useSelector(state => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`http://localhost:3001/products/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
        setError(error);
        setLoading(false);
      });
  }, [id]);
  const calculateTotal = products => {
    return products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
  };
  const handleAddToCart = () => {
    const token = localStorage.getItem("authToken");
    dispatch(addToCart());
    fetch(`${ADD_TO_CART_URL}${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const cartData = data[0];
          if (cartData.products && Array.isArray(cartData.products)) {
            const updatedProducts = removeDuplicates(cartData.products);
            setCartProducts(updatedProducts);
            setCartTotal(calculateTotal(updatedProducts));
            setDrawerOpen(true);
          } else {
            console.error("Formato dati imprevisto: ", cartData);
          }
        } else {
          console.error("Formato dati imprevisto: ", data);
        }
      })
      .catch(error => {
        console.error("Errore durante l'aggiunta al carrello:", error);
        alert("Errore durante l'aggiunta al carrello.");
      });
  };
  const handleRemoveFromCart = productId => {
    const token = localStorage.getItem("authToken");
    dispatch(removeFromCart());
    fetch(`${REMOVE_FROM_CART_URL}${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log("Risposta del server:", data);
        if (Array.isArray(data) && data.length > 0) {
          const updatedProducts = data[0].products || [];
          console.log("Prodotti aggiornati:", updatedProducts);

          const uniqueProducts = removeDuplicates(updatedProducts);
          setCartProducts(uniqueProducts);
          setCartTotal(calculateTotal(uniqueProducts));

          if (uniqueProducts.length === 0) {
            setDrawerOpen(false);
          }
        } else {
          console.error("Formato dati imprevisto: ", data);
        }
      })
      .catch(error => {
        console.error("Errore nella rimozione dal carrello:", error);
        alert("Errore durante la rimozione dal carrello.");
      });
  };

  const removeDuplicates = products => {
    return Array.from(
      new Map(products.map(product => [product.productId, product])).values()
    );
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <MyNavbar />
      <Container sx={{ my: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                alt={product.name}
                image={product.imageUrl}
                title={product.name}
                sx={{ height: 500, objectFit: "cover" }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 4 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {product.name}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "primary.main", fontSize: "2rem", mb: 2 }}
                >
                  {product.price} €
                </Typography>

                <Button
                  className="btn-hero"
                  variant="outlined"
                  onClick={handleAddToCart}
                  style={{
                    borderColor: "white",
                    color: "white",
                    backgroundColor: "black",
                    borderWidth: "2px",
                    marginRight: "8px",
                  }}
                >
                  Aggiungi al carrello
                </Button>
              </CardContent>
            </Card>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2">
                <CiDeliveryTruck /> Consegna gratuita sugli ordini superiori a
                85€ e resi gratuiti.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <LuLeafyGreen /> Il raggiungimento della soglia di spesa
                diminuisce l'impatto ambientale della tua spedizione.
              </Typography>
            </Box>
            <Accordion sx={{ mt: 4 }}>
              <AccordionSummary
                expandIcon={<GridExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Descrizione e Caratteristiche
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                  {product.description}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Brand: {product.brand}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  In Stock: {product.inMagazzino}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Category: {product.category}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Container>
      {/* Drawer per mostrare il carrello */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{ width: 400 }}
      >
        <Box
          sx={{ width: 300, p: 4, position: "relative" }}
          role="presentation"
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleDrawerClose}
            aria-label="close"
            sx={{ position: "absolute", right: 0, top: 0 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ mb: 2 }}
            className="text-center fw-bold"
          >
            Carrello
          </Typography>
          {Array.isArray(cartProducts) && cartProducts.length > 0 ? (
            <>
              {cartProducts.map(cartProduct => (
                <Card
                  key={cartProduct.productId}
                  sx={{ mb: 2 }}
                  className="my-3"
                >
                  <CardMedia
                    component="img"
                    alt={cartProduct.name}
                    image={cartProduct.imageUrl}
                    title={cartProduct.name}
                    sx={{ height: 150, objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6">{cartProduct.name}</Typography>
                    <Typography variant="body1">
                      {cartProduct.price} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantità: {cartProduct.quantity}
                    </Typography>
                    <Button
                      variant="outlined"
                      className="w-100 mt-2"
                      onClick={() =>
                        handleRemoveFromCart(cartProduct.productId)
                      }
                      style={{
                        borderColor: "black",
                        color: "black",
                        backgroundColor: "white",
                        borderWidth: "1px",
                        marginTop: "8px",
                      }}
                    >
                      Rimuovi
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Typography
                variant="h6"
                sx={{ mt: 2 }}
                className="fw-bold text-center"
              >
                Totale parziale: {cartTotal} €
              </Typography>
              <Button
                variant="contained"
                className="bg-dark text-white w-100 mt-4"
                onClick={() => navigate("/dashboardUtente")}
              >
                Procedi all'acquisto
              </Button>
            </>
          ) : (
            <Typography variant="body2">
              Nessun prodotto nel carrello
            </Typography>
          )}
        </Box>
      </Drawer>
      <Footer />
    </>
  );
};

export default ProductDetailsCustomer;
