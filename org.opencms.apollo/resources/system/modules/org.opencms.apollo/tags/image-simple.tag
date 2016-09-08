<%@ tag 
    display-name="image-simple"
    body-content="empty"
    trimDirectiveWhitespaces="true" 
    description="Formats a simple image from the given content" %>

<%@ attribute name="setting" type="java.util.Map" required="false" %>
<%@ attribute name="image" type="org.opencms.jsp.util.CmsJspContentAccessValueWrapper" required="true" %>
<%@ attribute name="link" type="org.opencms.jsp.util.CmsJspContentAccessValueWrapper" required="false" %>
<%@ attribute name="headline" type="org.opencms.jsp.util.CmsJspContentAccessValueWrapper" required="false" %>
<%@ attribute name="onlyimage" type="java.lang.Boolean" required="false" %>
<%@ attribute name="title" type="java.lang.String" required="false" %>
<%@ attribute name="width" type="java.lang.String" required="false" %>

<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="apollo" tagdir="/WEB-INF/tags/apollo" %>

<c:set var="ieffect">none</c:set>
<c:set var="istyle"></c:set>
<c:set var="itext">none</c:set>
<c:set var="ilink">none</c:set>
<c:if test="${not empty setting}">
    <c:if test="${not empty setting.ieffect}"><c:set var="ieffect">${setting.ieffect}</c:set></c:if>
    <c:if test="${not empty setting.istyle}"><c:set var="istyle">${setting.istyle}</c:set></c:if>
    <c:if test="${not empty setting.itext}"><c:set var="itext">${setting.itext}</c:set></c:if>
    <c:if test="${not empty setting.ilink}"><c:set var="ilink">${setting.ilink}</c:set></c:if>
</c:if>


<c:if test="${image.isSet}">
    <c:if test="${empty onlyimage}"><c:set var="onlyimage" value="false" /></c:if>
    <fmt:setLocale value="${cms.locale}" />
    <cms:bundle basename="org.opencms.apollo.template.formatters.messages">
        <apollo:image-vars image="${image}">
            <c:if test="${not empty imageLink}">
                <c:if test="${empty title}"><c:set var="title" value="${imageTitleCopyright}" /></c:if>

                <c:choose>
                    <c:when test="${onlyimage}">
                        <c:set var="imgattrs"></c:set>
                        <c:if test="${not empty width}">
                            <c:set var="imgattrs">width="${width}"</c:set>
                        </c:if>
                        <img
                            src="<cms:link>${imageLink}</cms:link>"
                            class="img-responsive ${ieffect != 'none' ? ieffect : ''}"
                            ${imgattrs}
                            alt="${title}"
                            title="${title}"
                        />
                    </c:when>
                    <c:otherwise>
                        <div class="ap-img ${istyle}">
                        <c:if test="${link.isSet && ilink != 'none'}">
                            <a class="ap-img-link" href="<cms:link>${link.value.URI}</cms:link>"
                                <c:if test="${link.value.Text.isSet}">
                                    title="${link.value.Text}"
                                </c:if>
                            >
                        </c:if>

                        <%-- ####### ImageDnD workaround ##################################### --%>
                        <%-- ####### image.value.Image.imageDndAttr doesn't work here ######## --%>
                        <%-- ################################################################# --%>

                        <c:if test="${not empty image && image.isSet}">
                            <c:set var="conValue" value="${image.value.Image.contentValue}" />
                            <c:set var="dndData" value="${conValue.document.file.structureId}|${conValue.path}|${conValue.locale}" />
                            <c:set var="imageDnd">data-imagednd="${dndData}"</c:set>
                        </c:if>

                        <%-- ################################################################# --%>

                            <div class="ap-img-pic">
                                <span ${image.value.Image.rdfaAttr} ${imageDnd}>
                                    <img
                                            src="<cms:link>${imageLink}</cms:link>"
                                            class="img-responsive ${ieffect != 'none' ? ieffect : ''}"
                                            alt="${title}"
                                            title="${title}"
                                    />
                                </span>
                            </div>

                            <%-- ####### Show copyright if enabled ######## --%>
                            <c:if test="${(fn:contains(itext, 'copy') or itext == 'true') && image.value.Copyright.isSet}">
                                <div class="info">
                                    <p class="copyright"><i>${imageCopyright}</i></p>
                                </div>
                            </c:if>

                            <c:if test="${itext != 'none'}">
                                <div class="ap-img-txt">
                                <c:if test="${fn:contains(itext, 'title')}">
                                        <c:choose>
                                                <c:when	test="${image.value.Title.isSet}">
                                                        <div class="ap-img-title"><span ${image.value.Title.rdfaAttr}>${image.value.Title}</span></div>
                                                </c:when>
                                                <c:when	test="${headline.isSet}">
                                                        <div class="ap-img-title"><span ${headline.rdfaAttr}>${headline}</span></div>
                                                </c:when>
                                        </c:choose>
                                </c:if>
                                <c:if test="${fn:contains(itext, 'desc') && image.value.Description.isSet}">
                                        <div class="ap-img-desc"><span ${image.value.Description.rdfaAttr}>${image.value.Description}</span></div>
                                </c:if>
                                </div>
                            </c:if>

                        <c:if test="${link.isSet && ilink != 'none'}">
                            </a>
                        </c:if>
                        </div>
                    </c:otherwise>
                </c:choose>
            </c:if>
        </apollo:image-vars>
    </cms:bundle>
</c:if>