/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
package apps.screens_howto.components.screens.content.responsivegrid;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.adobe.cq.sightly.WCMUsePojo;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;

public class SizesHelper extends WCMUsePojo {

    Resource childResource;
    Map<String, String> sizes;

    @Override
    public void activate() throws Exception {
        this.sizes = new HashMap<String, String>();

        this.childResource = get("childResource", Resource.class);
        Resource responsiveResource = this.childResource != null ? this.childResource.getChild("cq:responsive") : null;
        Iterator<Resource> breakepoints = responsiveResource != null ? getResourceResolver().listChildren(responsiveResource) : null;

        Resource breakepoint;
        ValueMap properties;
        String cssClassName;
        if (breakepoints != null) {
            while (breakepoints.hasNext()) {
                breakepoint = breakepoints.next();
                properties = breakepoint.adaptTo(ValueMap.class);
                cssClassName = "aem-GridRow--" + breakepoint.getName() + "--" + properties.get("height", "100");
                cssClassName += " aem-GridRow--voffset--" + breakepoint.getName() + "--" + properties.get("voffset", "0");
                this.sizes.put(breakepoint.getName(), cssClassName);
            }
        }
    }

    public String getSizeAndPositionClasses() {
        String cssClass = "";
        for (Map.Entry<String, String> cls: sizes.entrySet()) {
            cssClass += cls.getValue() + " ";
        }
        return cssClass.trim();
    }
}
