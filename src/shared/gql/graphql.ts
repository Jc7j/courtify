/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A high precision floating point value represented as a string */
  BigFloat: { input: string; output: string; }
  /** An arbitrary size integer represented as a string */
  BigInt: { input: string; output: string; }
  /** An opaque string using for tracking a position in results during pagination */
  Cursor: { input: any; output: any; }
  /** A date wihout time information */
  Date: { input: string; output: string; }
  /** A date and time */
  Datetime: { input: string; output: string; }
  /** A Javascript Object Notation value serialized as a string */
  JSON: { input: string; output: string; }
  /** Any type not handled by the type system */
  Opaque: { input: any; output: any; }
  /** A time without date information */
  Time: { input: string; output: string; }
  /** A universally unique identifier */
  UUID: { input: string; output: string; }
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  contains?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  eq?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Date']['input']>>;
  contains?: InputMaybe<Array<Scalars['Date']['input']>>;
  eq?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Date']['input']>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  contains?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  eq?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Float']['input']>>;
  contains?: InputMaybe<Array<Scalars['Float']['input']>>;
  eq?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Float']['input']>>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Int']['input']>>;
  contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  __typename?: 'Mutation';
  /** Deletes zero or more records from the `bookings` collection */
  deleteFrombookingsCollection: BookingsDeleteResponse;
  /** Deletes zero or more records from the `court_availabilities` collection */
  deleteFromcourt_availabilitiesCollection: Court_AvailabilitiesDeleteResponse;
  /** Deletes zero or more records from the `courts` collection */
  deleteFromcourtsCollection: CourtsDeleteResponse;
  /** Deletes zero or more records from the `facilities` collection */
  deleteFromfacilitiesCollection: FacilitiesDeleteResponse;
  /** Deletes zero or more records from the `facility_products` collection */
  deleteFromfacility_productsCollection: Facility_ProductsDeleteResponse;
  /** Deletes zero or more records from the `users` collection */
  deleteFromusersCollection: UsersDeleteResponse;
  /** Adds one or more `bookings` records to the collection */
  insertIntobookingsCollection?: Maybe<BookingsInsertResponse>;
  /** Adds one or more `court_availabilities` records to the collection */
  insertIntocourt_availabilitiesCollection?: Maybe<Court_AvailabilitiesInsertResponse>;
  /** Adds one or more `courts` records to the collection */
  insertIntocourtsCollection?: Maybe<CourtsInsertResponse>;
  /** Adds one or more `facilities` records to the collection */
  insertIntofacilitiesCollection?: Maybe<FacilitiesInsertResponse>;
  /** Adds one or more `facility_products` records to the collection */
  insertIntofacility_productsCollection?: Maybe<Facility_ProductsInsertResponse>;
  /** Adds one or more `users` records to the collection */
  insertIntousersCollection?: Maybe<UsersInsertResponse>;
  /** Updates zero or more records in the `bookings` collection */
  updatebookingsCollection: BookingsUpdateResponse;
  /** Updates zero or more records in the `court_availabilities` collection */
  updatecourt_availabilitiesCollection: Court_AvailabilitiesUpdateResponse;
  /** Updates zero or more records in the `courts` collection */
  updatecourtsCollection: CourtsUpdateResponse;
  /** Updates zero or more records in the `facilities` collection */
  updatefacilitiesCollection: FacilitiesUpdateResponse;
  /** Updates zero or more records in the `facility_products` collection */
  updatefacility_productsCollection: Facility_ProductsUpdateResponse;
  /** Updates zero or more records in the `users` collection */
  updateusersCollection: UsersUpdateResponse;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrombookingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BookingsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromcourt_AvailabilitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Court_AvailabilitiesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromcourtsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CourtsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromfacilitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<FacilitiesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromfacility_ProductsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Facility_ProductsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromusersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UsersFilter>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntobookingsCollectionArgs = {
  objects: Array<BookingsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntocourt_AvailabilitiesCollectionArgs = {
  objects: Array<Court_AvailabilitiesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntocourtsCollectionArgs = {
  objects: Array<CourtsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntofacilitiesCollectionArgs = {
  objects: Array<FacilitiesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntofacility_ProductsCollectionArgs = {
  objects: Array<Facility_ProductsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntousersCollectionArgs = {
  objects: Array<UsersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationUpdatebookingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BookingsFilter>;
  set: BookingsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatecourt_AvailabilitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Court_AvailabilitiesFilter>;
  set: Court_AvailabilitiesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatecourtsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CourtsFilter>;
  set: CourtsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatefacilitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<FacilitiesFilter>;
  set: FacilitiesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatefacility_ProductsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Facility_ProductsFilter>;
  set: Facility_ProductsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateusersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UsersFilter>;
  set: UsersUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The root type for querying data */
export type Query = {
  __typename?: 'Query';
  /** A pagable collection of type `bookings` */
  bookingsCollection?: Maybe<BookingsConnection>;
  /** A pagable collection of type `court_availabilities` */
  court_availabilitiesCollection?: Maybe<Court_AvailabilitiesConnection>;
  /** A pagable collection of type `courts` */
  courtsCollection?: Maybe<CourtsConnection>;
  /** A pagable collection of type `facilities` */
  facilitiesCollection?: Maybe<FacilitiesConnection>;
  /** A pagable collection of type `facility_products` */
  facility_productsCollection?: Maybe<Facility_ProductsConnection>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `users` */
  usersCollection?: Maybe<UsersConnection>;
};


/** The root type for querying data */
export type QueryBookingsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BookingsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BookingsOrderBy>>;
};


/** The root type for querying data */
export type QueryCourt_AvailabilitiesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Court_AvailabilitiesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Court_AvailabilitiesOrderBy>>;
};


/** The root type for querying data */
export type QueryCourtsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CourtsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CourtsOrderBy>>;
};


/** The root type for querying data */
export type QueryFacilitiesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<FacilitiesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FacilitiesOrderBy>>;
};


/** The root type for querying data */
export type QueryFacility_ProductsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Facility_ProductsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Facility_ProductsOrderBy>>;
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryUsersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UsersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Array<Scalars['String']['input']>>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Time']['input']>>;
  contains?: InputMaybe<Array<Scalars['Time']['input']>>;
  eq?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Time']['input']>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars['UUID']['input']>>;
  contains?: InputMaybe<Array<Scalars['UUID']['input']>>;
  eq?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export enum Availability_Status {
  Available = 'available',
  Booked = 'booked',
  Held = 'held'
}

/** Boolean expression comparing fields on type "availability_status" */
export type Availability_StatusFilter = {
  eq?: InputMaybe<Availability_Status>;
  in?: InputMaybe<Array<Availability_Status>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Availability_Status>;
};

export enum Booking_Status {
  Cancelled = 'cancelled',
  Confirmed = 'confirmed',
  Pending = 'pending'
}

/** Boolean expression comparing fields on type "booking_status" */
export type Booking_StatusFilter = {
  eq?: InputMaybe<Booking_Status>;
  in?: InputMaybe<Array<Booking_Status>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Booking_Status>;
};

export type Bookings = Node & {
  __typename?: 'bookings';
  amount_paid?: Maybe<Scalars['Int']['output']>;
  amount_total?: Maybe<Scalars['Int']['output']>;
  court_availabilities?: Maybe<Court_Availabilities>;
  court_number: Scalars['Int']['output'];
  created_at: Scalars['Datetime']['output'];
  currency: Scalars['String']['output'];
  customer_email: Scalars['String']['output'];
  customer_name: Scalars['String']['output'];
  customer_phone?: Maybe<Scalars['String']['output']>;
  facility_id: Scalars['UUID']['output'];
  id: Scalars['BigInt']['output'];
  metadata: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  payment_status: Payment_Status;
  start_time: Scalars['Datetime']['output'];
  status: Booking_Status;
  stripe_payment_intent_id?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Datetime']['output'];
};

export type BookingsConnection = {
  __typename?: 'bookingsConnection';
  edges: Array<BookingsEdge>;
  pageInfo: PageInfo;
};

export type BookingsDeleteResponse = {
  __typename?: 'bookingsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Bookings>;
};

export type BookingsEdge = {
  __typename?: 'bookingsEdge';
  cursor: Scalars['String']['output'];
  node: Bookings;
};

export type BookingsFilter = {
  amount_paid?: InputMaybe<IntFilter>;
  amount_total?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BookingsFilter>>;
  court_number?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  currency?: InputMaybe<StringFilter>;
  customer_email?: InputMaybe<StringFilter>;
  customer_name?: InputMaybe<StringFilter>;
  customer_phone?: InputMaybe<StringFilter>;
  facility_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<BigIntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BookingsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BookingsFilter>>;
  payment_status?: InputMaybe<Payment_StatusFilter>;
  start_time?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<Booking_StatusFilter>;
  stripe_payment_intent_id?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type BookingsInsertInput = {
  amount_paid?: InputMaybe<Scalars['Int']['input']>;
  amount_total?: InputMaybe<Scalars['Int']['input']>;
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  customer_email?: InputMaybe<Scalars['String']['input']>;
  customer_name?: InputMaybe<Scalars['String']['input']>;
  customer_phone?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['BigInt']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  payment_status?: InputMaybe<Payment_Status>;
  start_time?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Booking_Status>;
  stripe_payment_intent_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type BookingsInsertResponse = {
  __typename?: 'bookingsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Bookings>;
};

export type BookingsOrderBy = {
  amount_paid?: InputMaybe<OrderByDirection>;
  amount_total?: InputMaybe<OrderByDirection>;
  court_number?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  currency?: InputMaybe<OrderByDirection>;
  customer_email?: InputMaybe<OrderByDirection>;
  customer_name?: InputMaybe<OrderByDirection>;
  customer_phone?: InputMaybe<OrderByDirection>;
  facility_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  payment_status?: InputMaybe<OrderByDirection>;
  start_time?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  stripe_payment_intent_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type BookingsUpdateInput = {
  amount_paid?: InputMaybe<Scalars['Int']['input']>;
  amount_total?: InputMaybe<Scalars['Int']['input']>;
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  customer_email?: InputMaybe<Scalars['String']['input']>;
  customer_name?: InputMaybe<Scalars['String']['input']>;
  customer_phone?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['BigInt']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  payment_status?: InputMaybe<Payment_Status>;
  start_time?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Booking_Status>;
  stripe_payment_intent_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type BookingsUpdateResponse = {
  __typename?: 'bookingsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Bookings>;
};

export type Court_Availabilities = Node & {
  __typename?: 'court_availabilities';
  bookingsCollection?: Maybe<BookingsConnection>;
  court_number: Scalars['Int']['output'];
  courts?: Maybe<Courts>;
  created_at: Scalars['Datetime']['output'];
  end_time: Scalars['Datetime']['output'];
  facilities?: Maybe<Facilities>;
  facility_id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  start_time: Scalars['Datetime']['output'];
  status: Availability_Status;
  updated_at: Scalars['Datetime']['output'];
};


export type Court_AvailabilitiesBookingsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BookingsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BookingsOrderBy>>;
};

export type Court_AvailabilitiesConnection = {
  __typename?: 'court_availabilitiesConnection';
  edges: Array<Court_AvailabilitiesEdge>;
  pageInfo: PageInfo;
};

export type Court_AvailabilitiesDeleteResponse = {
  __typename?: 'court_availabilitiesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Court_Availabilities>;
};

export type Court_AvailabilitiesEdge = {
  __typename?: 'court_availabilitiesEdge';
  cursor: Scalars['String']['output'];
  node: Court_Availabilities;
};

export type Court_AvailabilitiesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Court_AvailabilitiesFilter>>;
  court_number?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  end_time?: InputMaybe<DatetimeFilter>;
  facility_id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Court_AvailabilitiesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Court_AvailabilitiesFilter>>;
  start_time?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<Availability_StatusFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type Court_AvailabilitiesInsertInput = {
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  end_time?: InputMaybe<Scalars['Datetime']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  start_time?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Availability_Status>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Court_AvailabilitiesInsertResponse = {
  __typename?: 'court_availabilitiesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Court_Availabilities>;
};

export type Court_AvailabilitiesOrderBy = {
  court_number?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  end_time?: InputMaybe<OrderByDirection>;
  facility_id?: InputMaybe<OrderByDirection>;
  start_time?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type Court_AvailabilitiesUpdateInput = {
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  end_time?: InputMaybe<Scalars['Datetime']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  start_time?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Availability_Status>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Court_AvailabilitiesUpdateResponse = {
  __typename?: 'court_availabilitiesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Court_Availabilities>;
};

export type Courts = Node & {
  __typename?: 'courts';
  court_availabilitiesCollection?: Maybe<Court_AvailabilitiesConnection>;
  court_number: Scalars['Int']['output'];
  created_at: Scalars['Datetime']['output'];
  facilities?: Maybe<Facilities>;
  facility_id: Scalars['UUID']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  updated_at: Scalars['Datetime']['output'];
};


export type CourtsCourt_AvailabilitiesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Court_AvailabilitiesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Court_AvailabilitiesOrderBy>>;
};

export type CourtsConnection = {
  __typename?: 'courtsConnection';
  edges: Array<CourtsEdge>;
  pageInfo: PageInfo;
};

export type CourtsDeleteResponse = {
  __typename?: 'courtsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Courts>;
};

export type CourtsEdge = {
  __typename?: 'courtsEdge';
  cursor: Scalars['String']['output'];
  node: Courts;
};

export type CourtsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<CourtsFilter>>;
  court_number?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  facility_id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<CourtsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<CourtsFilter>>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type CourtsInsertInput = {
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CourtsInsertResponse = {
  __typename?: 'courtsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Courts>;
};

export type CourtsOrderBy = {
  court_number?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  facility_id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type CourtsUpdateInput = {
  court_number?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CourtsUpdateResponse = {
  __typename?: 'courtsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Courts>;
};

export type Facilities = Node & {
  __typename?: 'facilities';
  address?: Maybe<Scalars['String']['output']>;
  court_availabilitiesCollection?: Maybe<Court_AvailabilitiesConnection>;
  courtsCollection?: Maybe<CourtsConnection>;
  created_at: Scalars['Datetime']['output'];
  facility_productsCollection?: Maybe<Facility_ProductsConnection>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  sports: Scalars['String']['output'];
  stripe_account_enabled?: Maybe<Scalars['Boolean']['output']>;
  stripe_account_id?: Maybe<Scalars['String']['output']>;
  stripe_currency?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Datetime']['output'];
  usersCollection?: Maybe<UsersConnection>;
};


export type FacilitiesCourt_AvailabilitiesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Court_AvailabilitiesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Court_AvailabilitiesOrderBy>>;
};


export type FacilitiesCourtsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CourtsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CourtsOrderBy>>;
};


export type FacilitiesFacility_ProductsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Facility_ProductsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Facility_ProductsOrderBy>>;
};


export type FacilitiesUsersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UsersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UsersOrderBy>>;
};

export type FacilitiesConnection = {
  __typename?: 'facilitiesConnection';
  edges: Array<FacilitiesEdge>;
  pageInfo: PageInfo;
};

export type FacilitiesDeleteResponse = {
  __typename?: 'facilitiesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facilities>;
};

export type FacilitiesEdge = {
  __typename?: 'facilitiesEdge';
  cursor: Scalars['String']['output'];
  node: Facilities;
};

export type FacilitiesFilter = {
  address?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<FacilitiesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<FacilitiesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<FacilitiesFilter>>;
  slug?: InputMaybe<StringFilter>;
  sports?: InputMaybe<StringFilter>;
  stripe_account_enabled?: InputMaybe<BooleanFilter>;
  stripe_account_id?: InputMaybe<StringFilter>;
  stripe_currency?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type FacilitiesInsertInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  sports?: InputMaybe<Scalars['String']['input']>;
  stripe_account_enabled?: InputMaybe<Scalars['Boolean']['input']>;
  stripe_account_id?: InputMaybe<Scalars['String']['input']>;
  stripe_currency?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type FacilitiesInsertResponse = {
  __typename?: 'facilitiesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facilities>;
};

export type FacilitiesOrderBy = {
  address?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  slug?: InputMaybe<OrderByDirection>;
  sports?: InputMaybe<OrderByDirection>;
  stripe_account_enabled?: InputMaybe<OrderByDirection>;
  stripe_account_id?: InputMaybe<OrderByDirection>;
  stripe_currency?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type FacilitiesUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  sports?: InputMaybe<Scalars['String']['input']>;
  stripe_account_enabled?: InputMaybe<Scalars['Boolean']['input']>;
  stripe_account_id?: InputMaybe<Scalars['String']['input']>;
  stripe_currency?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type FacilitiesUpdateResponse = {
  __typename?: 'facilitiesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facilities>;
};

export type Facility_Products = Node & {
  __typename?: 'facility_products';
  created_at: Scalars['Datetime']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  facilities?: Maybe<Facilities>;
  facility_id: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  is_active: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  price_amount: Scalars['Int']['output'];
  stripe_payment_type?: Maybe<Stripe_Payment_Type>;
  stripe_price_id?: Maybe<Scalars['String']['output']>;
  stripe_product_id?: Maybe<Scalars['String']['output']>;
  type: Product_Type;
  updated_at: Scalars['Datetime']['output'];
};

export type Facility_ProductsConnection = {
  __typename?: 'facility_productsConnection';
  edges: Array<Facility_ProductsEdge>;
  pageInfo: PageInfo;
};

export type Facility_ProductsDeleteResponse = {
  __typename?: 'facility_productsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facility_Products>;
};

export type Facility_ProductsEdge = {
  __typename?: 'facility_productsEdge';
  cursor: Scalars['String']['output'];
  node: Facility_Products;
};

export type Facility_ProductsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Facility_ProductsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  currency?: InputMaybe<StringFilter>;
  description?: InputMaybe<StringFilter>;
  facility_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Facility_ProductsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Facility_ProductsFilter>>;
  price_amount?: InputMaybe<IntFilter>;
  stripe_payment_type?: InputMaybe<Stripe_Payment_TypeFilter>;
  stripe_price_id?: InputMaybe<StringFilter>;
  stripe_product_id?: InputMaybe<StringFilter>;
  type?: InputMaybe<Product_TypeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type Facility_ProductsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price_amount?: InputMaybe<Scalars['Int']['input']>;
  stripe_payment_type?: InputMaybe<Stripe_Payment_Type>;
  stripe_price_id?: InputMaybe<Scalars['String']['input']>;
  stripe_product_id?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Product_Type>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Facility_ProductsInsertResponse = {
  __typename?: 'facility_productsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facility_Products>;
};

export type Facility_ProductsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  currency?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  facility_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  price_amount?: InputMaybe<OrderByDirection>;
  stripe_payment_type?: InputMaybe<OrderByDirection>;
  stripe_price_id?: InputMaybe<OrderByDirection>;
  stripe_product_id?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type Facility_ProductsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price_amount?: InputMaybe<Scalars['Int']['input']>;
  stripe_payment_type?: InputMaybe<Stripe_Payment_Type>;
  stripe_price_id?: InputMaybe<Scalars['String']['input']>;
  stripe_product_id?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Product_Type>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Facility_ProductsUpdateResponse = {
  __typename?: 'facility_productsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Facility_Products>;
};

export enum Member_Role {
  Admin = 'admin',
  Member = 'member',
  Owner = 'owner'
}

/** Boolean expression comparing fields on type "member_role" */
export type Member_RoleFilter = {
  eq?: InputMaybe<Member_Role>;
  in?: InputMaybe<Array<Member_Role>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Member_Role>;
};

export enum Payment_Status {
  Failed = 'failed',
  Paid = 'paid',
  Pending = 'pending',
  Processing = 'processing',
  Refunded = 'refunded'
}

/** Boolean expression comparing fields on type "payment_status" */
export type Payment_StatusFilter = {
  eq?: InputMaybe<Payment_Status>;
  in?: InputMaybe<Array<Payment_Status>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Payment_Status>;
};

export enum Product_Type {
  CourtRental = 'court_rental',
  Equipment = 'equipment'
}

/** Boolean expression comparing fields on type "product_type" */
export type Product_TypeFilter = {
  eq?: InputMaybe<Product_Type>;
  in?: InputMaybe<Array<Product_Type>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Product_Type>;
};

export enum Stripe_Payment_Type {
  OneTime = 'one_time',
  Recurring = 'recurring'
}

/** Boolean expression comparing fields on type "stripe_payment_type" */
export type Stripe_Payment_TypeFilter = {
  eq?: InputMaybe<Stripe_Payment_Type>;
  in?: InputMaybe<Array<Stripe_Payment_Type>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Stripe_Payment_Type>;
};

export type Users = Node & {
  __typename?: 'users';
  created_at: Scalars['Datetime']['output'];
  email: Scalars['String']['output'];
  facilities?: Maybe<Facilities>;
  facility_id?: Maybe<Scalars['UUID']['output']>;
  id: Scalars['UUID']['output'];
  is_active: Scalars['Boolean']['output'];
  joined_at?: Maybe<Scalars['Datetime']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  role: Member_Role;
  updated_at: Scalars['Datetime']['output'];
};

export type UsersConnection = {
  __typename?: 'usersConnection';
  edges: Array<UsersEdge>;
  pageInfo: PageInfo;
};

export type UsersDeleteResponse = {
  __typename?: 'usersDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};

export type UsersEdge = {
  __typename?: 'usersEdge';
  cursor: Scalars['String']['output'];
  node: Users;
};

export type UsersFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UsersFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  email?: InputMaybe<StringFilter>;
  facility_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  joined_at?: InputMaybe<DatetimeFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UsersFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UsersFilter>>;
  role?: InputMaybe<Member_RoleFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type UsersInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  joined_at?: InputMaybe<Scalars['Datetime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Member_Role>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UsersInsertResponse = {
  __typename?: 'usersInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};

export type UsersOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  email?: InputMaybe<OrderByDirection>;
  facility_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  joined_at?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  role?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type UsersUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  facility_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  joined_at?: InputMaybe<Scalars['Datetime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Member_Role>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UsersUpdateResponse = {
  __typename?: 'usersUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Users>;
};
