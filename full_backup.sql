--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

-- Started on 2025-11-07 17:17:05 +03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 73831)
-- Name: cart; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.cart (
    cart_id integer NOT NULL,
    customer_id integer NOT NULL,
    provider_id integer NOT NULL,
    details_order_user text,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status_pay character varying(20) DEFAULT 'Approve'::character varying,
    custom_requirement text,
    price numeric(10,2),
    provider_response text,
    sendedtoprovider boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_status_pay_check CHECK (((status_pay)::text = ANY ((ARRAY['Approve'::character varying, 'Unapprove'::character varying])::text[])))
);


ALTER TABLE public.cart OWNER TO hussam;

--
-- TOC entry 219 (class 1259 OID 73830)
-- Name: cart_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.cart_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_cart_id_seq OWNER TO hussam;

--
-- TOC entry 3588 (class 0 OID 0)
-- Dependencies: 219
-- Name: cart_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.cart_cart_id_seq OWNED BY public.cart.cart_id;


--
-- TOC entry 214 (class 1259 OID 73773)
-- Name: categories; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO hussam;

--
-- TOC entry 213 (class 1259 OID 73772)
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_category_id_seq OWNER TO hussam;

--
-- TOC entry 3589 (class 0 OID 0)
-- Dependencies: 213
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- TOC entry 230 (class 1259 OID 114702)
-- Name: messages; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO hussam;

--
-- TOC entry 229 (class 1259 OID 114701)
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_message_id_seq OWNER TO hussam;

--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 229
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- TOC entry 218 (class 1259 OID 73803)
-- Name: orders; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    customer_id integer NOT NULL,
    provider_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1,
    original_price numeric(10,2) NOT NULL,
    updated_price numeric(10,2),
    details_order_user text,
    status character varying(20) DEFAULT 'pending'::character varying,
    response_from_provider text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cart_id integer,
    datedelivery timestamp without time zone,
    add_customer_review boolean DEFAULT false,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'awaiting_approval'::character varying, 'on_progress'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO hussam;

--
-- TOC entry 217 (class 1259 OID 73802)
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_order_id_seq OWNER TO hussam;

--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 228 (class 1259 OID 81941)
-- Name: password_resets; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.password_resets (
    reset_id integer NOT NULL,
    user_id integer,
    phone character varying(25) NOT NULL,
    otp_hash character varying(255) NOT NULL,
    reset_token uuid,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_resets OWNER TO hussam;

--
-- TOC entry 227 (class 1259 OID 81940)
-- Name: password_resets_reset_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.password_resets_reset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_resets_reset_id_seq OWNER TO hussam;

--
-- TOC entry 3592 (class 0 OID 0)
-- Dependencies: 227
-- Name: password_resets_reset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.password_resets_reset_id_seq OWNED BY public.password_resets.reset_id;


--
-- TOC entry 216 (class 1259 OID 73782)
-- Name: products; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    provider_id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    location character varying(20) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    type_of_product character varying(50),
    image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    isavailable boolean DEFAULT true,
    timesordered integer DEFAULT 0,
    reactions jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT products_type_of_product_check CHECK (((type_of_product)::text = ANY ((ARRAY['product'::character varying, 'service'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO hussam;

--
-- TOC entry 215 (class 1259 OID 73781)
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_product_id_seq OWNER TO hussam;

--
-- TOC entry 3593 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 233 (class 1259 OID 147485)
-- Name: provider_balance; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.provider_balance (
    provider_id integer NOT NULL,
    total_balance numeric(10,2) DEFAULT 0
);


ALTER TABLE public.provider_balance OWNER TO hussam;

--
-- TOC entry 212 (class 1259 OID 73756)
-- Name: providers; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.providers (
    provider_id integer NOT NULL,
    user_id integer NOT NULL,
    bio text,
    skills text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stripe_account_id character varying(255)
);


ALTER TABLE public.providers OWNER TO hussam;

--
-- TOC entry 211 (class 1259 OID 73755)
-- Name: providers_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.providers_provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.providers_provider_id_seq OWNER TO hussam;

--
-- TOC entry 3594 (class 0 OID 0)
-- Dependencies: 211
-- Name: providers_provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.providers_provider_id_seq OWNED BY public.providers.provider_id;


--
-- TOC entry 224 (class 1259 OID 73875)
-- Name: reviews; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    product_id integer NOT NULL,
    customer_id integer NOT NULL,
    rating integer,
    review_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO hussam;

--
-- TOC entry 226 (class 1259 OID 73896)
-- Name: reviews_provider; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.reviews_provider (
    review_provider_id integer NOT NULL,
    provider_id integer NOT NULL,
    customer_id integer NOT NULL,
    rating integer,
    review_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_provider_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews_provider OWNER TO hussam;

--
-- TOC entry 225 (class 1259 OID 73895)
-- Name: reviews_provider_review_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.reviews_provider_review_provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_provider_review_provider_id_seq OWNER TO hussam;

--
-- TOC entry 3595 (class 0 OID 0)
-- Dependencies: 225
-- Name: reviews_provider_review_provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.reviews_provider_review_provider_id_seq OWNED BY public.reviews_provider.review_provider_id;


--
-- TOC entry 223 (class 1259 OID 73874)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_review_id_seq OWNER TO hussam;

--
-- TOC entry 3596 (class 0 OID 0)
-- Dependencies: 223
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- TOC entry 232 (class 1259 OID 147470)
-- Name: stripe_payments; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.stripe_payments (
    id integer NOT NULL,
    stripe_payment_id character varying(255) NOT NULL,
    customer_id integer,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'usd'::character varying,
    status character varying(50) NOT NULL,
    payment_date timestamp without time zone DEFAULT now(),
    cart_ids text,
    email character varying(255),
    provider_id integer,
    card_brand text,
    card_last4 text,
    card_exp_month integer,
    card_exp_year integer
);


ALTER TABLE public.stripe_payments OWNER TO hussam;

--
-- TOC entry 231 (class 1259 OID 147469)
-- Name: stripe_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.stripe_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stripe_payments_id_seq OWNER TO hussam;

--
-- TOC entry 3597 (class 0 OID 0)
-- Dependencies: 231
-- Name: stripe_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.stripe_payments_id_seq OWNED BY public.stripe_payments.id;


--
-- TOC entry 210 (class 1259 OID 73743)
-- Name: users; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    firstname character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    phone character varying(20) NOT NULL,
    profile_image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    lastname character varying(100),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'provider'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO hussam;

--
-- TOC entry 209 (class 1259 OID 73742)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO hussam;

--
-- TOC entry 3598 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 222 (class 1259 OID 73857)
-- Name: wishlist; Type: TABLE; Schema: public; Owner: hussam
--

CREATE TABLE public.wishlist (
    wishlist_id integer NOT NULL,
    customer_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlist OWNER TO hussam;

--
-- TOC entry 221 (class 1259 OID 73856)
-- Name: wishlist_wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: hussam
--

CREATE SEQUENCE public.wishlist_wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wishlist_wishlist_id_seq OWNER TO hussam;

--
-- TOC entry 3599 (class 0 OID 0)
-- Dependencies: 221
-- Name: wishlist_wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hussam
--

ALTER SEQUENCE public.wishlist_wishlist_id_seq OWNED BY public.wishlist.wishlist_id;


--
-- TOC entry 3341 (class 2604 OID 73834)
-- Name: cart cart_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.cart ALTER COLUMN cart_id SET DEFAULT nextval('public.cart_cart_id_seq'::regclass);


--
-- TOC entry 3328 (class 2604 OID 73776)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- TOC entry 3358 (class 2604 OID 114705)
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- TOC entry 3335 (class 2604 OID 73806)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 3355 (class 2604 OID 81944)
-- Name: password_resets reset_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN reset_id SET DEFAULT nextval('public.password_resets_reset_id_seq'::regclass);


--
-- TOC entry 3329 (class 2604 OID 73785)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 3326 (class 2604 OID 73759)
-- Name: providers provider_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.providers ALTER COLUMN provider_id SET DEFAULT nextval('public.providers_provider_id_seq'::regclass);


--
-- TOC entry 3349 (class 2604 OID 73878)
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 3352 (class 2604 OID 73899)
-- Name: reviews_provider review_provider_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews_provider ALTER COLUMN review_provider_id SET DEFAULT nextval('public.reviews_provider_review_provider_id_seq'::regclass);


--
-- TOC entry 3360 (class 2604 OID 147473)
-- Name: stripe_payments id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.stripe_payments ALTER COLUMN id SET DEFAULT nextval('public.stripe_payments_id_seq'::regclass);


--
-- TOC entry 3323 (class 2604 OID 73746)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3347 (class 2604 OID 73860)
-- Name: wishlist wishlist_id; Type: DEFAULT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN wishlist_id SET DEFAULT nextval('public.wishlist_wishlist_id_seq'::regclass);


--
-- TOC entry 3569 (class 0 OID 73831)
-- Dependencies: 220
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.cart (cart_id, customer_id, provider_id, details_order_user, product_id, quantity, created_at, status_pay, custom_requirement, price, provider_response, sendedtoprovider) FROM stdin;
178	22	5	\N	51	1	2025-10-13 23:08:02.024812	Approve	\N	5151.00	\N	f
179	22	6	\N	52	1	2025-10-13 23:08:04.94279	Approve	\N	45.00	\N	f
180	23	6	\N	52	1	2025-10-14 21:38:28.697396	Approve	\N	45.00	\N	f
181	23	6	\N	53	1	2025-10-14 21:38:34.326248	Approve	\N	15.00	\N	f
\.


--
-- TOC entry 3563 (class 0 OID 73773)
-- Dependencies: 214
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.categories (category_id, name, description) FROM stdin;
1	Handmade Crafts	Unique, handcrafted items made locally
2	Custom Clothing & Fashion	Tailored clothes and fashion design
3	Local Food & Catering	Homemade meals, baked goods, and catering services
4	Jewelry & Accessories	Handmade jewelry and fashion accessories
5	Art & Illustrations	Paintings, drawings, and custom illustrations
6	Event Planning & Decorations	Planning events and providing decorations
7	Home Decor	Handmade items to decorate and style your home
8	Electronics Accessories	Custom and handmade accessories for electronics
9	Organic Food	Healthy, locally sourced organic food products
10	Books & Stationery	Custom notebooks, planners, and artistic stationery
11	Beauty & Care	Natural handmade beauty and self-care products
12	Sports & Outdoors	Gear and accessories for outdoor activities and sports
\.


--
-- TOC entry 3579 (class 0 OID 114702)
-- Dependencies: 230
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.messages (message_id, sender_id, receiver_id, text, created_at) FROM stdin;
248	16	18	hey	2025-10-13 20:22:10.742369
249	16	18	asdjkb	2025-10-13 20:24:23.101577
250	18	16	asjdn	2025-10-13 20:24:36.514223
251	16	18	iia	2025-10-13 20:26:47.000004
252	16	18	uua	2025-10-13 20:31:51.343899
253	16	18	uuaw	2025-10-13 20:35:52.7779
254	16	18	lknasdub	2025-10-13 20:36:14.869521
255	20	18	asdww	2025-10-13 20:40:54.587293
256	21	18	hello	2025-10-13 20:41:54.035082
257	21	18	hey	2025-10-13 20:44:41.701147
258	20	18	asdww	2025-10-13 20:45:39.156191
259	21	18	awwq	2025-10-13 20:45:59.529649
260	21	18	hello	2025-10-13 20:46:12.742641
261	21	18	sadknfen	2025-10-13 20:46:30.533805
262	21	18	asdjfeb	2025-10-13 20:46:34.652133
263	21	18	asdww	2025-10-13 20:55:50.570123
264	21	18	asnfoibn	2025-10-13 20:56:05.870226
265	21	18	as., vfej	2025-10-13 20:56:43.172301
266	18	21	asfkn	2025-10-13 20:57:47.748935
267	21	18	oifnvvd	2025-10-13 20:57:52.078618
268	18	21	asdw	2025-10-13 21:02:03.063653
269	21	18	sadwi	2025-10-13 21:02:11.453159
270	18	21	asopdbne	2025-10-13 21:02:17.200976
271	21	18	ajsfcbibve	2025-10-13 21:02:21.60514
272	22	21	awwq	2025-10-13 21:03:45.45331
273	22	21	wwq	2025-10-13 21:04:12.052211
274	18	20	asdbue	2025-10-13 21:04:20.9808
275	22	18	aww	2025-10-13 21:04:47.765858
276	18	22	asdubev	2025-10-13 21:04:56.947557
277	18	22	asfne	2025-10-13 21:05:26.62981
278	22	18	asjne	2025-10-13 21:05:33.030662
279	22	18	wooo	2025-10-13 21:05:42.256001
280	18	22	wwqq	2025-10-13 21:05:50.459728
281	18	21	sjacnb	2025-10-13 21:06:12.743193
282	22	18	aww	2025-10-13 21:06:41.977585
283	18	22	waa	2025-10-13 21:06:50.174299
284	22	18	asjfb	2025-10-13 21:10:31.905692
285	18	22	like you 	2025-10-13 21:11:01.726382
286	22	18	me too	2025-10-13 21:11:07.699913
287	18	22	jbasb	2025-10-13 23:04:19.575443
288	22	18	uuu	2025-10-13 23:04:35.20235
289	22	18	kaka	2025-10-13 23:04:59.136655
290	18	22	kanna	2025-10-13 23:05:01.919464
291	18	22	hey	2025-10-14 21:16:18.065799
292	22	18	asninsac	2025-10-14 21:16:27.699384
293	18	22	askfnvsab	2025-10-14 21:16:34.243045
294	22	18	akskn 	2025-10-14 21:16:37.897417
295	18	22	k kkinomo	2025-10-14 21:18:18.967178
296	18	22	🙃	2025-10-14 21:19:03.18921
297	23	24	kasnd	2025-10-14 21:56:08.657456
298	24	23	🙃	2025-10-14 21:57:53.547995
299	24	23	asicbuu	2025-10-16 11:57:38.990834
300	23	24	onscb	2025-10-16 11:57:48.576887
301	23	24	hey	2025-10-16 12:02:19.732738
302	24	23	masmd	2025-10-16 12:02:30.603071
303	23	24	divms	2025-10-16 12:02:41.645791
304	25	24	asdasf	2025-10-21 20:18:24.325096
305	24	25	jnfj as	2025-10-21 20:20:29.170549
306	28	26	asfaslm	2025-10-26 21:30:48.957206
307	26	28	ousabfijbva	2025-10-26 21:31:02.845168
308	28	26	,nasfionsc	2025-10-26 21:31:10.780555
309	26	28	kasnk	2025-10-26 21:31:13.265198
310	36	33	asd	2025-10-29 22:26:13.479162
311	33	36	asffasn	2025-10-29 22:26:49.166153
312	36	33	ahvajv	2025-10-29 23:46:20.73323
313	36	33	sh	2025-10-29 23:46:33.791687
314	33	36	sjbsb	2025-10-29 23:46:42.638787
315	36	33	safkn	2025-10-30 00:11:14.51877
316	36	36	klanfjabs	2025-10-30 00:15:01.136386
317	33	36	asfjnb	2025-10-30 00:15:11.440935
318	36	36	aslfm	2025-10-30 00:15:55.516613
319	33	36	safknafj	2025-10-30 00:16:07.987547
320	36	36	asfnj	2025-10-30 00:22:11.118265
322	36	33	asfjbashb	2025-10-30 00:50:37.192172
323	33	36	oooo	2025-10-30 00:50:47.056342
324	33	36	asfjkbf	2025-10-30 00:54:41.665509
325	36	33	asjfbba	2025-10-30 00:54:52.817192
358	33	36	a	2025-10-30 16:47:55.547852
359	36	33	iiai	2025-10-30 16:49:52.7703
360	33	36	oaoao	2025-10-30 16:50:11.148583
361	36	36	asfj	2025-10-30 16:53:51.172719
362	33	36	hjvgv	2025-10-30 16:55:12.667041
\.


--
-- TOC entry 3567 (class 0 OID 73803)
-- Dependencies: 218
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.orders (order_id, customer_id, provider_id, product_id, quantity, original_price, updated_price, details_order_user, status, response_from_provider, created_at, cart_id, datedelivery, add_customer_review) FROM stdin;
108	36	7	55	1	15.00	\N	\N	pending	\N	2025-10-26 23:51:35.779851	\N	\N	f
110	36	6	54	1	15.00	\N	\N	pending	\N	2025-10-27 00:40:22.357897	\N	\N	f
143	36	6	54	3	15.00	\N	naskd	awaiting_approval	\N	2025-10-28 22:32:16.066986	\N	\N	f
109	36	6	52	1	45.00	\N	asf;lmsafn	awaiting_approval	\N	2025-10-27 00:31:30.91727	\N	\N	f
146	36	6	52	1	45.00	\N	\N	pending	\N	2025-10-29 21:07:27.826542	\N	\N	f
147	36	6	54	1	15.00	\N	\N	pending	\N	2025-10-29 21:07:27.84444	\N	\N	f
148	36	6	53	1	15.00	\N	\N	pending	\N	2025-10-29 21:07:27.852691	\N	\N	f
102	15	5	51	1	15.00	\N	hussua	completed	\N	2025-10-12 21:31:10.714119	\N	\N	f
144	36	9	56	1	15.00	\N	asdfasn	rejected	\N	2025-10-28 22:33:57.30875	\N	\N	f
105	22	6	52	1	111.00	\N	asd	completed	\N	2025-10-13 21:17:04.513016	\N	\N	f
103	22	5	51	1	5151.00	\N	sadas	awaiting_approval	\N	2025-10-13 21:16:12.624633	\N	\N	f
106	27	7	55	1	15.00	\N	\N	pending	\N	2025-10-26 21:21:35.891004	\N	\N	f
145	36	9	56	1	15.00	\N	omar	rejected	\N	2025-10-28 22:34:42.821018	\N	\N	f
152	36	9	90	1	15.00	\N	moo	completed	\N	2025-10-29 21:32:14.879959	\N	\N	t
149	36	9	90	1	15.00	\N	\N	completed	\N	2025-10-29 21:20:06.634253	\N	\N	t
150	36	9	57	1	1.00	\N	\N	completed	\N	2025-10-29 21:20:06.65092	\N	\N	t
107	36	9	56	1	15.00	\N	\N	completed	\N	2025-10-26 23:51:35.76504	\N	\N	t
153	36	6	52	1	45.00	\N	asfbas	rejected	\N	2025-11-03 20:54:02.942383	\N	\N	f
154	36	7	55	1	15.00	\N	safknas	rejected	\N	2025-11-03 20:55:04.256193	\N	\N	f
155	36	9	90	1	15.00	\N	asdfknas	rejected	1hu	2025-11-03 20:56:26.43439	\N	\N	f
159	36	9	91	1	15.00	\N	asdasdd	completed	\N	2025-11-06 14:50:54.109333	\N	\N	t
\.


--
-- TOC entry 3577 (class 0 OID 81941)
-- Dependencies: 228
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.password_resets (reset_id, user_id, phone, otp_hash, reset_token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 3565 (class 0 OID 73782)
-- Dependencies: 216
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.products (product_id, provider_id, category_id, name, location, description, price, type_of_product, image, created_at, isavailable, timesordered, reactions) FROM stdin;
57	9	1	sadffsain	asfasdfasdasd	ppp	1.00	product	\N	2025-10-27 00:41:53.244627	t	1	{"support": [36]}
90	9	1	asd	sascfsvsv	oininoni	15.00	product	/uploads/1761680858360.jpg	2025-10-28 22:47:38.38914	t	2	{"love": [36]}
55	7	1	sadasf	05151515	sadklnfsaokcnask	15.00	product	\N	2025-10-26 21:21:05.901504	t	2	{"support": [36]}
56	9	1	csajvnasjvn	asfinsocina	asconascon	15.00	product	\N	2025-10-26 23:50:20.7645	t	1	{"proud": [36]}
53	6	1	oooooo	amman	knsnsk	15.00	service	\N	2025-10-14 21:31:52.661926	t	1	{"love": [36], "proud": [24]}
54	6	8	sadasd	aaa	aaaa	15.00	product	\N	2025-10-14 21:33:17.973739	t	2	{"proud": [], "support": [36]}
91	9	1	asdsa	safas	asdfasfsfa	12.00	product	https://firebasestorage.googleapis.com/v0/b/job-tracker-b9e24.firebasestorage.app/o/product%2F1762427738035_Flowchart.jpg?alt=media&token=a237a459-2c5c-4a8e-9369-75860ac11688	2025-11-06 14:15:40.15709	t	1	{}
51	5	1	sadasd	amman	ooooo	5151.00	service	\N	2025-10-12 21:29:18.511352	t	1	{"support": []}
52	6	1	asd	51651	sacas	45.00	product	\N	2025-10-13 21:16:28.577338	t	2	{"love": [23], "proud": [], "support": [24]}
\.


--
-- TOC entry 3582 (class 0 OID 147485)
-- Dependencies: 233
-- Data for Name: provider_balance; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.provider_balance (provider_id, total_balance) FROM stdin;
9	46.00
\.


--
-- TOC entry 3561 (class 0 OID 73756)
-- Dependencies: 212
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.providers (provider_id, user_id, bio, skills, created_at, stripe_account_id) FROM stdin;
5	17	\N	\N	2025-10-12 21:28:44.244301	\N
6	18	\N	\N	2025-10-13 19:02:45.081611	\N
7	28	\N	\N	2025-10-26 21:20:40.515219	\N
8	29	\N	\N	2025-10-26 22:23:39.316033	\N
9	33	\N	\N	2025-10-26 22:52:35.934943	acct_1SQPZP8j5ffB8FAN
\.


--
-- TOC entry 3573 (class 0 OID 73875)
-- Dependencies: 224
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.reviews (review_id, product_id, customer_id, rating, review_text, created_at) FROM stdin;
19	90	36	4	husasmwowowo	2025-10-29 21:32:58.23839
20	90	36	4	aslkdfn	2025-10-30 16:50:56.37651
21	57	36	3	asfkn	2025-10-30 16:51:01.1449
22	56	36	3	asflkn	2025-10-30 16:51:05.05305
23	91	36	3	good product 	2025-11-06 14:52:06.994545
\.


--
-- TOC entry 3575 (class 0 OID 73896)
-- Dependencies: 226
-- Data for Name: reviews_provider; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.reviews_provider (review_provider_id, provider_id, customer_id, rating, review_text, created_at) FROM stdin;
21	5	35	4	salknaskcn 	2025-10-26 23:30:24.497788
22	6	35	5	skafncoasncoanscoiasncvoiasncviasnv0iasnv	2025-10-26 23:30:48.396189
23	6	36	4	asofnkaoisnaoisncioan	2025-10-26 23:33:31.339523
24	5	36	5	oubibnubb	2025-10-26 23:33:57.786532
25	9	36	4	khvhbhb	2025-10-28 22:30:51.463702
\.


--
-- TOC entry 3581 (class 0 OID 147470)
-- Dependencies: 232
-- Data for Name: stripe_payments; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.stripe_payments (id, stripe_payment_id, customer_id, amount, currency, status, payment_date, cart_ids, email, provider_id, card_brand, card_last4, card_exp_month, card_exp_year) FROM stdin;
1	cs_test_b1Kie6jB7cAtUQdeDXqf1ALRORu29JSbwfZkxTFN26KEPYm7TfBYH5skOC	36	16.00	usd	paid	2025-10-29 21:20:06.568756	{"240","239"}	b@gmail.com	9	\N	\N	\N	\N
2	cs_test_a1ajlKFPZr3lxszXDBY0jrUze3D7gXeP3de7rkjmWTY3zEQ0dhW7jQiblW	36	15.00	usd	paid	2025-10-29 21:32:14.855361	{"241"}	b@gmail.com	9	\N	\N	\N	\N
3	cs_test_a1W76wTqmCs5uJKR3blyWyOtDRowfoZB5JExdAET1oTiDs6O2teoRQUUo5	36	15.00	usd	paid	2025-11-06 14:50:54.075322	251	b@gmail.com	9	\N	\N	\N	\N
\.


--
-- TOC entry 3559 (class 0 OID 73743)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.users (user_id, firstname, email, password_hash, role, phone, profile_image, created_at, lastname) FROM stdin;
15	hussam	hussam@gmail.com	$2b$10$0PRyjgTMgz.4IBnwfvGT8edfT5H7S.JAvsWxkx4ASkzCHevg7ixuG	customer	+962798588888	\N	2025-10-12 21:26:45.488507	ibrahim
16	ibrahim	ibrahim@gmail.com	$2b$10$T.pBq15T9eEpKzvyDFAoeOISY9vX40zC1gkyet75LUNRlKgMR5ava	customer	+962799818181	\N	2025-10-12 21:27:58.308141	ooo
17	ooo	oo@gmail.com	$2b$10$ga8AXmDTauqS3I8nKB0tYuCnTVEAm4m2w3Bb7ZAiw9vvkF5qsK7q2	provider	+962789816518	\N	2025-10-12 21:28:44.244301	ooo
18	omar	omar@gmail.com	$2b$10$WxKCjTLPyywTs3uagIgs4.Wao6Saw72xHoVzBUapVa0tBfasa6QhC	provider	+962789165156	\N	2025-10-13 19:02:45.081611	iiq
19	iib	iib@gmail.com	$2b$10$Z3cOcDLCCK/Rnzzak4XIre/.FkyrqcaRXvf73I3rkg1inw/hV60/e	customer	+962798156155	\N	2025-10-13 20:02:11.970038	iib
20	aaaa	a@gmail.com	$2b$10$t4rjtxea7lDZNH4QH1rFn.YW3Ut2dmCwLkrd1rbMF5MaXdRufOTPm	customer	+962789516515	\N	2025-10-13 20:40:32.264292	aaa
21	jaw	j@gmail.com	$2b$10$7oUlmVtruo1TGHTXYz/12.3GEQyYSrYb5dMHz6pysYQZGpYS8P57e	customer	+962798235153	\N	2025-10-13 20:41:34.125317	jaw
22	asa	aa@gmail.com	$2b$10$hLWNs//YuFag6SDw7IYjBOv3ZKhR5kBL8QWxZ1xxwzZGyYGHwsT1O	customer	+962789825555	\N	2025-10-13 21:03:20.650258	asa
23	omar	omar1@gmail.com	$2b$10$846v6XwpmUq4Wm1rDwOAK.2mPdX20xuW7SaFVAdpdvCjL6.DJJBPu	customer	+962789815151	\N	2025-10-14 21:37:21.161755	llll
24	aaa	aaaa@gmail.com	$2b$10$LCf2HUro2fiMCkJCVthMd.ir/Biy59MwYraAD8ZR9vLvzk4bS6uBm	customer	+962784515155	\N	2025-10-14 21:40:18.333962	aaa
25	hussam	ai@gmail.com	$2b$10$KGMlRr6Et0QkmXk87TYuLurfJjaonX4k.kDEVjN6oltyFEQT/9pMK	customer	+962798285222	\N	2025-10-21 20:12:45.501972	aaa
26	laa	la@gmail.com	$2b$10$3ws7Ye2wvR1RnApd0Y3x6eLWXIaxg/5PYOq2/7u9DpcK.16AqupG6	customer	+962789814143	\N	2025-10-26 21:12:54.139804	laa
27	oqq	oq@gmail.com	$2b$10$wMLRdRXeXz1RgLp1/pozR.w3jxcS8ZBztCF9ShZSbO5qCDC9ncYBa	customer	+962789851515	\N	2025-10-26 21:18:25.988779	oqq
28	qqq	q@gmail.com	$2b$10$937jOe6YX3gbarBfhCbO8elAnrW52d7WAwpTZEFvu5sQr3XjfKgvW	provider	+962789855255	\N	2025-10-26 21:20:40.515219	qqq
29	ppp	p@gmail.com	$2b$10$QY4FVKhJg88AC9OfgWeJ8O4sPiYCH/IfM07qISHjL9ZMToBYhUDDm	provider	+962789814147	\N	2025-10-26 22:23:39.316033	ppp
30	aaa	op@gmail.com	$2b$10$4cSeR3JlMryYtgeW.qUR5uF2SR9fYDsf7ztLj7537tolSMZqZCzq2	customer	+962789814149	\N	2025-10-26 22:28:56.563065	aaa
31	qqq	huss@gmail.com	$2b$10$p2cmpRjef8CENyA9boWYt.cxDonKPBHcoJtdLFm1zD0arGO7ip9Qm	customer	+962789814145	\N	2025-10-26 22:29:59.791045	qqq
32	mmm	m@gmail.com	$2b$10$w1Px69afni3FLfMBLgzd1.WD./S/95dqs2b1ZTaLI8FGnz6o2XYFe	customer	+962789814155	\N	2025-10-26 22:31:47.268622	mmm
34	asfd	i@gmail.com	$2b$10$Zkt6k2Bf.2nXpkQVeNNw0OMZuAxYhtnYLbL8zKxTEFxxMziulsZti	customer	+962789141489	\N	2025-10-26 22:55:42.331639	dasd
35	iii	ap@gmail.com	$2b$10$eWC0fo/6o8fjY8bSit9NveS4QoDJB7aSl6zgQp3A0AtE6Rp69r912	customer	+962789814140	\N	2025-10-26 23:12:38.873218	iiii
36	aiai	b@gmail.com	$2b$10$PwF/cz.pJ9eXEpTjcw3XiONxdoy13MdQQBgLUaGEZhKv358X5Hvme	customer	+962789814142	\N	2025-10-26 23:33:07.964688	iaiai
33	aonoi	l@gmail.com	$2b$10$r8bA15s9DMPyJMeL3qzsVO676nYf6Ji7ObnWK9vLFhXWx1pO7vlsG	provider	+962789814146	/uploads/1761514444942.jpg	2025-10-26 22:52:35.934943	koasndvon
\.


--
-- TOC entry 3571 (class 0 OID 73857)
-- Dependencies: 222
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: hussam
--

COPY public.wishlist (wishlist_id, customer_id, product_id, created_at) FROM stdin;
107	22	52	2025-10-13 23:08:07.59409
108	22	51	2025-10-13 23:08:09.723744
140	24	54	2025-10-18 14:28:09.665322
147	36	53	2025-11-06 12:43:53.994235
\.


--
-- TOC entry 3600 (class 0 OID 0)
-- Dependencies: 219
-- Name: cart_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.cart_cart_id_seq', 251, true);


--
-- TOC entry 3601 (class 0 OID 0)
-- Dependencies: 213
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 6, true);


--
-- TOC entry 3602 (class 0 OID 0)
-- Dependencies: 229
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 362, true);


--
-- TOC entry 3603 (class 0 OID 0)
-- Dependencies: 217
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 159, true);


--
-- TOC entry 3604 (class 0 OID 0)
-- Dependencies: 227
-- Name: password_resets_reset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.password_resets_reset_id_seq', 1, false);


--
-- TOC entry 3605 (class 0 OID 0)
-- Dependencies: 215
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.products_product_id_seq', 91, true);


--
-- TOC entry 3606 (class 0 OID 0)
-- Dependencies: 211
-- Name: providers_provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.providers_provider_id_seq', 9, true);


--
-- TOC entry 3607 (class 0 OID 0)
-- Dependencies: 225
-- Name: reviews_provider_review_provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.reviews_provider_review_provider_id_seq', 25, true);


--
-- TOC entry 3608 (class 0 OID 0)
-- Dependencies: 223
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 23, true);


--
-- TOC entry 3609 (class 0 OID 0)
-- Dependencies: 231
-- Name: stripe_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.stripe_payments_id_seq', 3, true);


--
-- TOC entry 3610 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.users_user_id_seq', 36, true);


--
-- TOC entry 3611 (class 0 OID 0)
-- Dependencies: 221
-- Name: wishlist_wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hussam
--

SELECT pg_catalog.setval('public.wishlist_wishlist_id_seq', 147, true);


--
-- TOC entry 3380 (class 2606 OID 73840)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 3374 (class 2606 OID 73780)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3394 (class 2606 OID 114710)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- TOC entry 3378 (class 2606 OID 73814)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3392 (class 2606 OID 81948)
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (reset_id);


--
-- TOC entry 3376 (class 2606 OID 73791)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3398 (class 2606 OID 147492)
-- Name: provider_balance provider_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.provider_balance
    ADD CONSTRAINT provider_balance_pkey PRIMARY KEY (provider_id);


--
-- TOC entry 3370 (class 2606 OID 73764)
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (provider_id);


--
-- TOC entry 3372 (class 2606 OID 73766)
-- Name: providers providers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);


--
-- TOC entry 3386 (class 2606 OID 73884)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 3388 (class 2606 OID 73905)
-- Name: reviews_provider reviews_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews_provider
    ADD CONSTRAINT reviews_provider_pkey PRIMARY KEY (review_provider_id);


--
-- TOC entry 3396 (class 2606 OID 147479)
-- Name: stripe_payments stripe_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.stripe_payments
    ADD CONSTRAINT stripe_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3382 (class 2606 OID 106511)
-- Name: wishlist uniq_customer_product; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT uniq_customer_product UNIQUE (customer_id, product_id);


--
-- TOC entry 3365 (class 2606 OID 73754)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3368 (class 2606 OID 73752)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3384 (class 2606 OID 73863)
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (wishlist_id);


--
-- TOC entry 3389 (class 1259 OID 81954)
-- Name: idx_pwresets_phone; Type: INDEX; Schema: public; Owner: hussam
--

CREATE INDEX idx_pwresets_phone ON public.password_resets USING btree (phone);


--
-- TOC entry 3390 (class 1259 OID 81955)
-- Name: idx_pwresets_token; Type: INDEX; Schema: public; Owner: hussam
--

CREATE INDEX idx_pwresets_token ON public.password_resets USING btree (reset_token);


--
-- TOC entry 3366 (class 1259 OID 139278)
-- Name: users_email_lower_ux; Type: INDEX; Schema: public; Owner: hussam
--

CREATE UNIQUE INDEX users_email_lower_ux ON public.users USING btree (lower((email)::text));


--
-- TOC entry 3406 (class 2606 OID 73841)
-- Name: cart cart_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3407 (class 2606 OID 73851)
-- Name: cart cart_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 3408 (class 2606 OID 73921)
-- Name: cart cart_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(provider_id);


--
-- TOC entry 3416 (class 2606 OID 114716)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3417 (class 2606 OID 114711)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3402 (class 2606 OID 81935)
-- Name: orders orders_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id) ON DELETE SET NULL;


--
-- TOC entry 3403 (class 2606 OID 73815)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3404 (class 2606 OID 73825)
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 3405 (class 2606 OID 73820)
-- Name: orders orders_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(provider_id);


--
-- TOC entry 3415 (class 2606 OID 81949)
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3400 (class 2606 OID 73797)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- TOC entry 3401 (class 2606 OID 73792)
-- Name: products products_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(provider_id) ON DELETE CASCADE;


--
-- TOC entry 3399 (class 2606 OID 73767)
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3411 (class 2606 OID 73890)
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3412 (class 2606 OID 73885)
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 3413 (class 2606 OID 73911)
-- Name: reviews_provider reviews_provider_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews_provider
    ADD CONSTRAINT reviews_provider_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3414 (class 2606 OID 73906)
-- Name: reviews_provider reviews_provider_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.reviews_provider
    ADD CONSTRAINT reviews_provider_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(provider_id) ON DELETE CASCADE;


--
-- TOC entry 3418 (class 2606 OID 147480)
-- Name: stripe_payments stripe_payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.stripe_payments
    ADD CONSTRAINT stripe_payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3409 (class 2606 OID 73864)
-- Name: wishlist wishlist_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3410 (class 2606 OID 73869)
-- Name: wishlist wishlist_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hussam
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


-- Completed on 2025-11-07 17:17:05 +03

--
-- PostgreSQL database dump complete
--

