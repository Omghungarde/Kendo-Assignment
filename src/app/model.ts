export class Product {
    ProductID!: number;
    ProductName!: string;
    SupplierID?: number;
    CategoryID?: number;
    QuantityPerUnit?: string;
    UnitPrice!: number;
    UnitsInStock?: number;
    UnitsOnOrder?: number;
    ReorderLevel?: number;
    Discontinued?: boolean;
    Category!: {
      CategoryID: number;
      CategoryName: string;
      Description?: string;
    };
  }
  
//   export class Order {
//     public OrderID: number;
//     public CustomerID: string;
//     public EmployeeID: number;
//     public OrderDate: Date;
//     public RequiredDate: Date;
//     public ShippedDate: Date;
//     public ShipVia: number;
//     public Freight: number;
//     public ShipName: string;
//     public ShipAddress: string;
//     public ShipCity: string;
//     public ShipRegion: string;
//     public ShipPostalCode: string;
//     public ShipCountry: string;
//   }
  
  export class Customer {
    public Id = "";
    public CompanyName = "";
    public ContactName = "";
    public ContactTitle = "";
    public Address?: string = "";
    public City = "";
    public PostalCode? = "";
    public Country? = "";
    public Phone? = "";
    public Fax? = "";
  }
  
  export class Category {
    public CategoryID?: number;
    public CategoryName?: string;
    public Description?: string;
  }
  export class Items {
    public ID?: string;
    public Product?: string;
    public Quantity?: number;
    public Price?: number;
    public Tax?: number;
    public Total?: number;
  }
  