using System;

namespace StockApi.Exceptions
{
    public class FournisseurNotFoundException : Exception
    {
        public FournisseurNotFoundException(string message) : base(message) { }
    }

    public class CommandeNotFoundException : Exception
    {
        public CommandeNotFoundException(string message) : base(message) { }
    }

    public class ProduitNotFoundException : Exception
    {
        public ProduitNotFoundException(string message) : base(message) { }
    }

    public class InvalidQuantityException : Exception
    {
        public InvalidQuantityException(string message) : base(message) { }
    }

    public class InvalidUnitPriceException : Exception
    {
        public InvalidUnitPriceException(string message) : base(message) { }
    }

    public class InvalidSeuilException : Exception
    {
        public InvalidSeuilException(string message) : base(message) { }
    }

    public class InvalidPeremptionDateException : Exception
    {
        public InvalidPeremptionDateException(string message) : base(message) { }
    }

    public class ProduitInactifException : Exception
    {
        public ProduitInactifException(string message) : base(message) { }
    }

    public class InsufficientStockException : Exception
    {
        public InsufficientStockException(string message) : base(message) { }
    }

    public class DuplicateProductNameException : Exception
    {
        public DuplicateProductNameException(string message) : base(message) { }
    }

    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
    }

    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

    public class InvalidOperationException : Exception
    {
        public InvalidOperationException(string message) : base(message) { }
    }
}
