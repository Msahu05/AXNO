import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminSizeChartsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Edit, X } from 'lucide-react';

const categories = ['Hoodie', 'T-Shirt', 'Sweatshirt'];
const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const defaultMeasurements = ['chest', 'toFitChest', 'shoulder', 'length'];

const SizeChartsEditor = ({ sizeCharts, onRefresh }) => {
  const { toast } = useToast();
  const [editingChart, setEditingChart] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [availableSizes, setAvailableSizes] = useState(defaultSizes);
  const [availableMeasurements, setAvailableMeasurements] = useState(defaultMeasurements);

  // Initialize form data when editing
  useEffect(() => {
    if (editingChart) {
      const chart = sizeCharts.find(c => c.category === editingChart);
      if (chart) {
        // Extract sizes and measurements from existing data
        const sizesFromData = Object.keys(chart.measurements?.inches || {});
        const measurementsFromData = chart.measurements?.inches?.[sizesFromData[0]] 
          ? Object.keys(chart.measurements.inches[sizesFromData[0]])
          : defaultMeasurements;
        
        setAvailableSizes(sizesFromData.length > 0 ? sizesFromData : defaultSizes);
        setAvailableMeasurements(measurementsFromData.length > 0 ? measurementsFromData : defaultMeasurements);
        
        setFormData({
          category: chart.category,
          fitDescription: chart.fitDescription || 'Oversized Fit',
          fitDetails: chart.fitDetails || 'Falls loosely on the body',
          measurements: chart.measurements || {
            inches: {},
            cms: {}
          }
        });
      } else {
        // New chart - initialize with defaults
        setAvailableSizes(defaultSizes);
        setAvailableMeasurements(defaultMeasurements);
        setFormData({
          category: editingChart,
          fitDescription: 'Oversized Fit',
          fitDetails: 'Falls loosely on the body',
          measurements: {
            inches: {
              S: { chest: 46, toFitChest: 38, shoulder: 24, length: 26.5 },
              M: { chest: 48, toFitChest: 40, shoulder: 25, length: 27.5 },
              L: { chest: 50, toFitChest: 42, shoulder: 26, length: 28.5 },
              XL: { chest: 52, toFitChest: 44, shoulder: 27, length: 29 },
              XXL: { chest: 54, toFitChest: 46, shoulder: 28, length: 29.5 },
              XXXL: { chest: 56, toFitChest: 48, shoulder: 29, length: 30 }
            },
            cms: {
              S: { chest: 117, toFitChest: 97, shoulder: 61, length: 67 },
              M: { chest: 122, toFitChest: 102, shoulder: 64, length: 70 },
              L: { chest: 127, toFitChest: 107, shoulder: 66, length: 72 },
              XL: { chest: 132, toFitChest: 112, shoulder: 69, length: 74 },
              XXL: { chest: 137, toFitChest: 117, shoulder: 71, length: 75 },
              XXXL: { chest: 142, toFitChest: 122, shoulder: 74, length: 76 }
            }
          }
        });
      }
    }
  }, [editingChart, sizeCharts]);

  const handleMeasurementChange = (unit, size, measurement, value) => {
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      
      // Update the current unit
      if (!newData.measurements[unit]) {
        newData.measurements[unit] = {};
      }
      if (!newData.measurements[unit][size]) {
        newData.measurements[unit][size] = {};
      }
      newData.measurements[unit][size][measurement] = numValue;
      
      // Auto-convert to the other unit
      const otherUnit = unit === 'inches' ? 'cms' : 'inches';
      const conversionFactor = unit === 'inches' ? 2.54 : 1 / 2.54; // 1 inch = 2.54 cm
      const convertedValue = Math.round((numValue * conversionFactor) * 10) / 10; // Round to 1 decimal place
      
      if (!newData.measurements[otherUnit]) {
        newData.measurements[otherUnit] = {};
      }
      if (!newData.measurements[otherUnit][size]) {
        newData.measurements[otherUnit][size] = {};
      }
      newData.measurements[otherUnit][size][measurement] = convertedValue;
      
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminSizeChartsAPI.save(formData);
      toast({
        title: 'Success',
        description: 'Size chart saved successfully',
      });
      setEditingChart(null);
      setFormData(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving size chart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save size chart',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete the size chart for ${category}?`)) {
      return;
    }

    try {
      await adminSizeChartsAPI.delete(category);
      toast({
        title: 'Success',
        description: 'Size chart deleted successfully',
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting size chart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete size chart',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRow = (size) => {
    if (!confirm(`Are you sure you want to delete the ${size} row?`)) {
      return;
    }

    setAvailableSizes(prev => prev.filter(s => s !== size));
    setFormData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      ['inches', 'cms'].forEach(unit => {
        if (newData.measurements && newData.measurements[unit] && newData.measurements[unit][size]) {
          delete newData.measurements[unit][size];
        }
      });
      return newData;
    });
    
    toast({
      title: 'Success',
      description: `Size ${size} row deleted`,
    });
  };

  const handleDeleteColumn = (measurement) => {
    if (!confirm(`Are you sure you want to delete the ${measurement} column?`)) {
      return;
    }

    setAvailableMeasurements(prev => prev.filter(m => m !== measurement));
    setFormData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      ['inches', 'cms'].forEach(unit => {
        if (newData.measurements && newData.measurements[unit]) {
          Object.keys(newData.measurements[unit]).forEach(size => {
            if (newData.measurements[unit][size] && newData.measurements[unit][size][measurement]) {
              delete newData.measurements[unit][size][measurement];
            }
          });
        }
      });
      return newData;
    });
    
    toast({
      title: 'Success',
      description: `${measurement} column deleted`,
    });
  };

  const handleAddRow = () => {
    const newSize = prompt('Enter the new size name (e.g., XS, 2XL):');
    if (!newSize || newSize.trim() === '') return;
    
    const sizeName = newSize.trim().toUpperCase();
    if (availableSizes.includes(sizeName)) {
      toast({
        title: 'Error',
        description: 'This size already exists',
        variant: 'destructive',
      });
      return;
    }

    setAvailableSizes(prev => [...prev, sizeName]);
    setFormData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      ['inches', 'cms'].forEach(unit => {
        if (!newData.measurements[unit]) {
          newData.measurements[unit] = {};
        }
        if (!newData.measurements[unit][sizeName]) {
          newData.measurements[unit][sizeName] = {};
          availableMeasurements.forEach(measurement => {
            newData.measurements[unit][sizeName][measurement] = 0;
          });
        }
      });
      return newData;
    });
    
    toast({
      title: 'Success',
      description: `Size ${sizeName} added`,
    });
  };

  const handleAddColumn = () => {
    const newMeasurement = prompt('Enter the new measurement name (e.g., sleeve, waist):');
    if (!newMeasurement || newMeasurement.trim() === '') return;
    
    const measurementName = newMeasurement.trim();
    if (availableMeasurements.includes(measurementName)) {
      toast({
        title: 'Error',
        description: 'This measurement already exists',
        variant: 'destructive',
      });
      return;
    }

    setAvailableMeasurements(prev => [...prev, measurementName]);
    setFormData(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      ['inches', 'cms'].forEach(unit => {
        if (!newData.measurements[unit]) {
          newData.measurements[unit] = {};
        }
        availableSizes.forEach(size => {
          if (!newData.measurements[unit][size]) {
            newData.measurements[unit][size] = {};
          }
          newData.measurements[unit][size][measurementName] = 0;
        });
      });
      return newData;
    });
    
    toast({
      title: 'Success',
      description: `${measurementName} column added`,
    });
  };

  if (editingChart) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Size Chart - {editingChart}</CardTitle>
            <Button
              variant="outline"
              onClick={() => {
                setEditingChart(null);
                setFormData(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fit Description</label>
                  <Input
                    value={formData.fitDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, fitDescription: e.target.value }))}
                    placeholder="Oversized Fit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fit Details</label>
                  <Input
                    value={formData.fitDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, fitDetails: e.target.value }))}
                    placeholder="Falls loosely on the body"
                  />
                </div>
              </div>

              {/* Inches Measurements */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Measurements (Inches)</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddRow}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Row
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddColumn}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Column
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                        {availableMeasurements.map(m => (
                          <th key={m} className="border border-gray-300 px-4 py-2 text-left capitalize relative group">
                            <div className="flex items-center justify-between">
                              <span>{m === 'toFitChest' ? 'To Fit Chest' : m}</span>
                              <button
                                onClick={() => handleDeleteColumn(m)}
                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                title="Delete column"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availableSizes.map(size => (
                        <tr key={size} className="group">
                          <td className="border border-gray-300 px-4 py-2 font-semibold relative">
                            <div className="flex items-center justify-between">
                              <span>{size}</span>
                              <button
                                onClick={() => handleDeleteRow(size)}
                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                title="Delete row"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          {availableMeasurements.map(measurement => (
                            <td key={measurement} className="border border-gray-300 px-4 py-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.measurements.inches[size]?.[measurement] || ''}
                                onChange={(e) => handleMeasurementChange('inches', size, measurement, e.target.value)}
                                className="w-20"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CMs Measurements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Measurements (Centimeters)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                        {availableMeasurements.map(m => (
                          <th key={m} className="border border-gray-300 px-4 py-2 text-left capitalize relative group">
                            <div className="flex items-center justify-between">
                              <span>{m === 'toFitChest' ? 'To Fit Chest' : m}</span>
                              <button
                                onClick={() => handleDeleteColumn(m)}
                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                title="Delete column"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availableSizes.map(size => (
                        <tr key={size} className="group">
                          <td className="border border-gray-300 px-4 py-2 font-semibold relative">
                            <div className="flex items-center justify-between">
                              <span>{size}</span>
                              <button
                                onClick={() => handleDeleteRow(size)}
                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                title="Delete row"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          {availableMeasurements.map(measurement => (
                            <td key={measurement} className="border border-gray-300 px-4 py-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.measurements.cms[size]?.[measurement] || ''}
                                onChange={(e) => handleMeasurementChange('cms', size, measurement, e.target.value)}
                                className="w-20"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Size Chart'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(editingChart)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size Charts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => {
            const chart = sizeCharts.find(c => c.category === category);
            return (
              <div
                key={category}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold">{category}</h3>
                  <p className="text-sm text-gray-500">
                    {chart ? 'Configured' : 'Not configured (using defaults)'}
                  </p>
                </div>
                <Button
                  onClick={() => setEditingChart(category)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {chart ? 'Edit' : 'Create'}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SizeChartsEditor;


