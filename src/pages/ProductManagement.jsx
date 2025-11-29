import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { allProducts, findProductById } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const ProductManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    original: 0,
    audience: 'men',
    accent: '',
    gallery: []
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/admin/products/' + productId);
      return;
    }

    if (!user?.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    loadProduct();
  }, [productId, isAuthenticated, user]);

  const loadProduct = () => {
    try {
      setLoading(true);
      const foundProduct = findProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name || '',
          category: foundProduct.category || '',
          price: foundProduct.price || 0,
          original: foundProduct.original || 0,
          audience: foundProduct.audience || 'men',
          accent: foundProduct.accent || '',
          gallery: foundProduct.gallery || []
        });
      } else {
        toast({
          title: 'Error',
          description: 'Product not found',
          variant: 'destructive',
        });
        navigate('/admin');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Note: Since products are in a static file, we can't actually save changes
    // This is a view-only management page for now
    // In production, you'd want to store products in a database
    toast({
      title: 'Info',
      description: 'Product data is read-only. To modify products, update the products.js file directly.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Product not found</p>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <Header />
      <div className="px-4 sm:px-6 lg:px-16 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Product Management</h1>
              <p className="text-muted-foreground">Product ID: {product.id}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.gallery && product.gallery.length > 0 ? (
                    product.gallery.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No images available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Audience</label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                        disabled
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (₹)</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Original Price (₹)</label>
                      <Input
                        type="number"
                        value={formData.original}
                        onChange={(e) => setFormData({ ...formData, original: parseFloat(e.target.value) || 0 })}
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount</label>
                    <Input
                      value={formData.original > 0 ? `${Math.round(((formData.original - formData.price) / formData.original) * 100)}%` : '0%'}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Accent Color</label>
                    <Input
                      value={formData.accent}
                      onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                      disabled
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes (Read-only)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Products are stored in products.js file. To modify, edit the file directly.
                  </p>
                </CardContent>
              </Card>

              {/* Product Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gallery Images:</span>
                    <span>{product.gallery?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product ID:</span>
                    <span className="text-xs font-mono">{product.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;

