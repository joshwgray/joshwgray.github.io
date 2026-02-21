+++
date = '2026-02-21T00:00:00Z'
draft = false
title = 'Exploring Scalar as a Modern Alternative to Swagger for .NET APIs'
description = 'A deep dive into Scalar, a modern API documentation tool that offers a fresh alternative to Swagger for .NET developers'
tags = ['dotnet', 'api-documentation', 'scalar', 'swagger', 'openapi', 'developer-tools']
categories = ['Software Development']
series = ['API Development']
+++

# Exploring Scalar as a Modern Alternative to Swagger for .NET APIs

Recently, I've been exploring different API documentation tooling. While Swagger (Swashbuckle) has long been the standard for OpenAPI documentation in .NET, I discovered an interesting alternative: Scalar.

This article shares my experience implementing Scalar and why it might be worth considering for your next .NET API project.

## What is Scalar?

Scalar is a modern, open-source API documentation tool that generates beautiful, interactive documentation from your OpenAPI specifications. Unlike traditional tools that can feel heavyweight, Scalar takes a streamlined approach with an emphasis on:

- **Developer experience** - Clean, intuitive interface for exploring and testing APIs
- **Modern design** - Responsive UI that looks great out of the box
- **Performance** - Fast, lightweight client that doesn't bog down your development workflow
- **Simplicity** - Minimal configuration required to get started

## Why Consider Scalar Over Swagger?

Don't get me wrong - Swagger/Swashbuckle is battle-tested and works great. But here's why Scalar caught my attention:

### 1. **Modern UI/UX**
Scalar's interface feels contemporary and polished. It's designed with modern web standards and provides a cleaner, more intuitive experience than the classic Swagger UI.

### 2. **Minimal API Alignment**
With .NET's shift toward minimal APIs, Scalar's lightweight philosophy feels like a natural fit. It embraces simplicity without sacrificing functionality.

### 3. **Better Developer Experience**
Scalar provides features like:
- Three-panel layout (documentation, request, response)
- Dark mode support
- Better syntax highlighting
- More intuitive request testing
- Improved search and navigation

### 4. **Zero Config to Get Started**
While Swagger requires some boilerplate setup, Scalar works with minimal configuration while still offering deep customization when you need it.

### 5. **Active Development**
Scalar is being actively developed with modern web technologies, which means regular updates and improvements.

## Setting Up Scalar in Your .NET Project

Getting started with Scalar is straightforward. Here's a step-by-step guide:

### 1. Install the Package

Add the Scalar NuGet package to your project:

```bash
dotnet add package Scalar.AspNetCore
```

### 2. Configure in Program.cs

Here's a minimal setup that gets you up and running:

> **Note for .NET 9+:** `AddEndpointsApiExplorer()` is no longer required when using the built-in `AddOpenApi()`. It's included here for compatibility with older versions.

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer(); // Not needed in .NET 9+
builder.Services.AddOpenApi(); // Built-in OpenAPI support

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Maps the OpenAPI endpoint
    app.MapScalarApiReference(); // Adds Scalar UI
}

// Define your APIs
app.MapGet("/api/products", () => 
    new[] { 
        new { Id = 1, Name = "Product 1", Price = 29.99 },
        new { Id = 2, Name = "Product 2", Price = 39.99 }
    })
    .WithName("GetProducts")
    .WithTags("Products");

app.MapGet("/api/products/{id}", (int id) => 
    new { Id = id, Name = $"Product {id}", Price = 29.99 })
    .WithName("GetProduct")
    .WithTags("Products");

app.Run();
```

### 3. Explore Your API

Run your application and navigate to `/scalar/v1` (or your configured endpoint). You'll see Scalar's documentation UI where you can view, test, and interact with your APIs.

## Advanced Configuration

Scalar offers extensive customization options. Here are some common scenarios:

### Customize the UI Path

Change where Scalar is hosted:

```csharp
app.MapScalarApiReference(options =>
{
    options.WithEndpointPrefix("/api-docs");
});
```

### Configure Metadata, Branding, and Themes

Customize the appearance, metadata, and theming in a single options block:

```csharp
app.MapScalarApiReference(options =>
{
    options
        .WithTitle("My API Documentation")
        .WithTheme(ScalarTheme.Purple)    // Built-in themes: Default, BluePlanet, Saturn, Kepler, Mars, DeepSpace, Solarized...
        .WithDarkMode(true)
        .WithDefaultOpenAllTags(true)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
});
```

### Add Authentication Configuration

Configure authentication for testing endpoints directly in the UI:

```csharp
app.MapScalarApiReference(options =>
{
    options
        .WithPreferredScheme("Bearer")
        .WithApiKeyAuthentication(x => x.Token = "your-api-key");
});
```

### Organize with Tags

Use tags to group related endpoints:

```csharp
app.MapGet("/api/users", () => new[] { "user1", "user2" })
    .WithTags("Users")
    .WithDescription("Retrieves all users");

app.MapGet("/api/orders", () => new[] { "order1", "order2" })
    .WithTags("Orders")
    .WithDescription("Retrieves all orders");
```

### Exclude Endpoints from Documentation

Keep internal endpoints out of your documentation:

```csharp
app.MapGet("/api/internal/health", () => "OK")
    .ExcludeFromDescription(); // Won't appear in Scalar
```

## Key Features Worth Calling Out

Here are a few capabilities that go beyond the basics and genuinely change how you work with the docs day-to-day:

### 1. **Client Code Generation**
Scalar can generate ready-to-use request code directly from the UI across a wide range of targets - C#, JavaScript/TypeScript, Python, Go, Java, Shell (`curl`/`wget`), and more. This is particularly useful when onboarding frontend developers or third-party consumers: instead of walking them through how to call an endpoint, you hand them working code.

### 2. **Deep Linking to Endpoints**
Every endpoint in Scalar has a stable, shareable URL. In practice this means you can paste a link directly to `POST /api/orders` in a Slack message or PR description and your colleague lands exactly there - no scrolling through a wall of endpoints. Sounds minor, but it noticeably reduces friction in code reviews and API design discussions.

### 3. **Markdown in Descriptions**
You can use full Markdown in `WithDescription()` and `WithSummary()` calls, including code blocks, tables, and links. This lets you embed usage notes, deprecation warnings, or example payloads right alongside the endpoint - keeping documentation close to the code rather than in a separate wiki that inevitably goes stale.

### 4. **Downloadable OpenAPI Spec**
The UI exposes a direct link to download the raw OpenAPI JSON/YAML. This is handy when you want to import the spec into Postman, share it with a consumer generating their own client, or feed it into an API gateway configuration.

### 5. **Environment/Server Switching**
If your `OpenAPI` document defines multiple servers (e.g. `localhost`, staging, production), Scalar surfaces a server selector in the UI. This lets you point the request builder at different environments without leaving the documentation tab - useful for quickly sanity-checking a staging deployment.

## When to Use Scalar vs. Swagger

### Choose Scalar if:
- You're building a new API and want a modern documentation experience
- Developer experience and UI/UX are priorities
- You prefer minimal configuration
- You're working with minimal APIs

### Stick with Swagger if:
- You have existing Swagger/Swashbuckle implementations
- Your team is already familiar with Swagger tooling
- You need specific Swagger ecosystem integrations
- You require features unique to Swashbuckle

## Real-World Example

Here's a more complete example showing Scalar in a realistic API:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("Product Catalog API")
            .WithTheme(ScalarTheme.BluePlanet)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
            .WithDarkMode(true);
    });
}

// Products endpoints
var products = app.MapGroup("/api/products")
    .WithTags("Products")
    .WithOpenApi();

products.MapGet("/", () => Results.Ok(new[] 
    {
        new { Id = 1, Name = "Laptop", Price = 999.99, InStock = true },
        new { Id = 2, Name = "Mouse", Price = 24.99, InStock = true }
    }))
    .WithName("GetAllProducts")
    .WithSummary("Get all products")
    .WithDescription("Retrieves the complete product catalog");

products.MapGet("/{id}", (int id) => 
    {
        if (id <= 0)
            return Results.BadRequest("Invalid product ID");
            
        return Results.Ok(new { Id = id, Name = $"Product {id}", Price = 99.99 });
    })
    .WithName("GetProductById")
    .WithSummary("Get product by ID")
    .WithDescription("Retrieves a specific product by its unique identifier");

products.MapPost("/", (Product product) => 
    {
        // Validation and creation logic
        return Results.Created($"/api/products/{product.Id}", product);
    })
    .WithName("CreateProduct")
    .WithSummary("Create a new product")
    .WithDescription("Adds a new product to the catalog");

// Orders endpoints
var orders = app.MapGroup("/api/orders")
    .WithTags("Orders")
    .WithOpenApi();

orders.MapGet("/", () => Results.Ok(new[] 
    {
        new { Id = 1, ProductId = 1, Quantity = 2, Total = 1999.98 }
    }))
    .WithName("GetAllOrders");

app.Run();

record Product(int Id, string Name, decimal Price, bool InStock);
```

## Final Thoughts

I think that Scalar should become a go-to choice for new .NET API projects. Its modern interface, minimal configuration, and excellent developer experience make API documentation feel less like a chore and more like a natural part of the development process.

That said, there's no one-size-fits-all solution. If you're maintaining existing projects with Swagger, there's no urgent need to switch. But for greenfield projects or if you're curious about trying something new, I'd recommend giving Scalar a go.

---

**Resources:**
- [Scalar Official Documentation](https://github.com/scalar/scalar)
- [Scalar.AspNetCore Package](https://www.nuget.org/packages/Scalar.AspNetCore)
- [OpenAPI Specification](https://swagger.io/specification/)
