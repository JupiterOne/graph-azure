# Microsoft Resource Manager Tag Support

Grouping resouces is important for accomplishing a number of infrastructure
management tasks. This is supported in Azure using resource groups and tagging.
The Azure [Tags How to][1] states:

> Tags enable you to retrieve related resources from different resource groups.

See [Tag Support][2] for details on which resources support tagging, because not
all of them do 😳. This means that it will not be possible to leverage tags as
additional properties on JupiterOne entities representing resources that do not
support tagging.

The Blob service allows for [storing HTTP header metadata][3], which is not
considered by the integration to be similar to tags.

[1]:
  https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-using-tags
[2]: https://docs.microsoft.com/en-us/azure/azure-resource-manager/tag-support
[3]:
  https://docs.microsoft.com/en-us/rest/api/storageservices/setting-and-retrieving-properties-and-metadata-for-blob-resources
