require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_API_KEY);
const express = require("express");
const cors = require("cors");
const accountSid = 'AC9c03229435bcdf369efb66ee8e982617';
const authToken = 'e1ed3ff45e1ecd45453ec6b1944ce136';
const client = require('twilio')(accountSid, authToken);

const app = express();




app.use(cors());
app.use(express.json());

 
    
const PAYMENT_CONFIRMATION_URL = `${process.env.FRONT_END_URL}/payment-confirmation`;

app.post("/create-checkout-session", async (req, res) => {
  console.log(req.body);
  const items = req.body.products.map((product) => ({
    price_data: {
      currency: "brl",
      product_data: {
        name: `${product.name} ${product.size}`,
        
      },
      unit_amount: parseInt(`${product.price}00`),
    },
    quantity: product.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: items,
    mode: "payment",
    success_url: `${PAYMENT_CONFIRMATION_URL}?success=true`,
    cancel_url: `${PAYMENT_CONFIRMATION_URL}?canceled=true`,
   

  });

  // Enviar informações do pedido para o WhatsApp do administrador
  const pedidoInfo = items.map((item) => `${item.price_data.product_data.name} - Quantidade: ${item.quantity} - Preço Total: ${item.price_data.unit_amount}`);
  const pedidoMensagem = `Você recebeu um novo pedido:\n${pedidoInfo.join('\n')}`;


function enviarPedido(){
  return (
    client.messages
  .create({
    body: pedidoMensagem,
    from: '+14344855434',
    to: '+5511948798912', // Seu número de WhatsApp
  })
  .then((message) => console.log(`Mensagem enviada com SID: ${message.sid}`))
  )
}
enviarPedido(session.success_url)



    


  res.send({ url: session.url });
});

app.listen(process.env.PORT || 5000);



