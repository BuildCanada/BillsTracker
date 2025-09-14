import { useState, useEffect } from "react";

import { Search, X, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface FilterState {
  search: string;
  status: string[];
  category: string[];
  party: string[];
  chamber: string[];
  dateRange: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  forceCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const statusOptions = [
  { value: 'introduced', label: 'Introduced' },
  { value: 'committee', label: 'In Committee' },
  { value: 'passed-house', label: 'Passed House' },
  { value: 'passed-senate', label: 'Passed Senate' },
  { value: 'enacted', label: 'Enacted' },
  { value: 'failed', label: 'Failed' }
];

const categoryOptions = [
  'Healthcare',
  'Education',
  'Environment',
  'Economy',
  'Defense',
  'Immigration',
  'Technology',
  'Transportation',
  'Agriculture',
  'Energy'
];

const partyOptions = [
  { value: 'Democrat', label: 'Democrat' },
  { value: 'Republican', label: 'Republican' },
  { value: 'Independent', label: 'Independent' }
];

const chamberOptions = [
  { value: 'House', label: 'House' },
  { value: 'Senate', label: 'Senate' }
];

export function FilterSidebar({ filters, onFiltersChange, onClearFilters, forceCollapsed, onCollapsedChange }: FilterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(forceCollapsed ?? false);

  // Update collapsed state when forceCollapsed prop changes
  useEffect(() => {
    if (forceCollapsed !== undefined) {
      setIsCollapsed(forceCollapsed);
    }
  }, [forceCollapsed]);

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'status' | 'category' | 'party' | 'chamber', value: string) => {
    const currentValues = filters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.status.length;
    count += filters.category.length;
    count += filters.party.length;
    count += filters.chamber.length;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-0 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs px-2"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseToggle}
              className="px-2"
            >
              {isCollapsed ? '+' : '−'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => updateFilter('search', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.value}
                    checked={filters.status.includes(status.value)}
                    onCheckedChange={() => toggleArrayFilter('status', status.value)}
                  />
                  <Label htmlFor={status.value} className="text-sm font-normal">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label>Category</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categoryOptions.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={filters.category.includes(category)}
                    onCheckedChange={() => toggleArrayFilter('category', category)}
                  />
                  <Label htmlFor={category} className="text-sm font-normal">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Party */}
          <div className="space-y-3">
            <Label>Sponsor Party</Label>
            <div className="space-y-2">
              {partyOptions.map((party) => (
                <div key={party.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={party.value}
                    checked={filters.party.includes(party.value)}
                    onCheckedChange={() => toggleArrayFilter('party', party.value)}
                  />
                  <Label htmlFor={party.value} className="text-sm font-normal">
                    {party.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Chamber */}
          <div className="space-y-3">
            <Label>Chamber</Label>
            <div className="space-y-2">
              {chamberOptions.map((chamber) => (
                <div key={chamber.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={chamber.value}
                    checked={filters.chamber.includes(chamber.value)}
                    onCheckedChange={() => toggleArrayFilter('chamber', chamber.value)}
                  />
                  <Label htmlFor={chamber.value} className="text-sm font-normal">
                    {chamber.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="last-3-months">Last 3 months</SelectItem>
                <SelectItem value="last-6-months">Last 6 months</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  );
}