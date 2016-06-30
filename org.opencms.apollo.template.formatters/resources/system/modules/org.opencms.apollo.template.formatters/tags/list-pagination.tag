<%@ tag display-name="list-pagination"
  trimDirectiveWhitespaces="true" 
  body-content="empty"
  description="Shows a pagination based on search results."%>

<%@ attribute name="search" type="org.opencms.jsp.search.result.I_CmsSearchResultWrapper" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<c:if test="${search.numFound > 0}">

	<c:set var="pagination" value="${search.controller.pagination}" />
	<!-- show pagination if it should be given and if it's really necessary -->
	<c:if test="${not empty pagination && search.numPages > 1}">
		<div  id="pagination" data-dynamic="false" >
			<ul class="pagination">
				<li ${pagination.state.currentPage > 1 ? "" : "class='disabled'"}>
					<a href="javascript:void(0)"
					onclick='reloadInnerList("${search.stateParameters.setPage['1']}")'
				   aria-label='<fmt:message key="pagination.first.title"/>'>
						<span aria-hidden="true"><fmt:message
								key="pagination.first" /></span>
				</a>
				</li>
				<c:set var="previousPage">${pagination.state.currentPage > 1 ? pagination.state.currentPage - 1 : 1}</c:set>
				<li ${pagination.state.currentPage > 1 ? "" : "class='disabled'"}>
					<a href="javascript:void(0)"
					onclick='reloadInnerList("${search.stateParameters.setPage[previousPage]}")'
					aria-label='<fmt:message key="pagination.previous.title"/>'>
						<span aria-hidden="true"><fmt:message
								key="pagination.previous" /></span>
				</a>
				</li>
				<c:forEach var="i" begin="${search.pageNavFirst}"
					end="${search.pageNavLast}">
					<c:set var="is">${i}</c:set>
					<li ${pagination.state.currentPage eq i ? "class='active'" : ""}>
						<a href="javascript:void(0)"
						onclick='reloadInnerList("${search.stateParameters.setPage[is]}")'>${is}</a>
					</li>
				</c:forEach>
				<c:set var="pages">${search.numPages}</c:set>
				<c:set var="next">${pagination.state.currentPage < search.numPages ? pagination.state.currentPage + 1 : pagination.state.currentPage}</c:set>
				<li
					${pagination.state.currentPage >= search.numPages ? "class='disabled'" : ""}>
					<a aria-label='<fmt:message key="pagination.next.title"/>'
					href="javascript:void(0)"
					onclick='reloadInnerList("${search.stateParameters.setPage[next]}")'>
						<span aria-hidden="true"><fmt:message
								key="pagination.next" /></span>
				</a>
				</li>
				<li
					${pagination.state.currentPage >= search.numPages ? "class='disabled'" : ""}>
					<a aria-label='<fmt:message key="pagination.last.title"/>'
					href="javascript:void(0)"
					onclick='reloadInnerList("${search.stateParameters.setPage[pages]}")'>
						<span aria-hidden="true"><fmt:message
								key="pagination.last" /></span>
				</a>
				</li>
			</ul>
		</div>
	</c:if>

</c:if>